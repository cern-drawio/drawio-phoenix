<template>
  <div>
    <iframe id="drawio-editor" ref="drawioEditor" :src="iframeSource"/>

    <name-selector ref="nameSelector"/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import queryString from 'query-string'
import NameSelector from './NameSelector.vue'

const theme = {
  KENNEDY: 'kennedy',
  ATLAS: 'atlas',
  DARK: 'dark'
}

var autoSaveEnabled = 1
var drawioURL = 'https://drawio-cernbox.web.cern.ch?'
var permissions = true
var selectedTheme = theme.KENNEDY

export default {
  name: 'DrawioEditor',

  components: {
    NameSelector
  },

  data: () => ({
    filePath: '',
    extension: '',
    currentETag: null
  }),

  computed: {
    ...mapGetters(['getToken']),

    loading () {
      return this.content === ''
    },

    iframeSource () {
      const query = queryString.stringify({
        embed: 1,
        chrome: permissions ? 1 : 0,
        picker: 0,
        stealth: 1,
        spin: 1,
        proto: 'json',
        ui: selectedTheme
      })

      return drawioURL + query
    }
  },

  mounted () {
    this.filePath = this.$route.params.filePath
    this.extension = this.filePath.split('.').pop()

    window.addEventListener('message', event => {
      console.log(event)
      if (event.data.length > 0) {
        var payload = JSON.parse(event.data)

        switch (payload.event) {
          case 'init':
            if (this.extension === 'vsdx') {
              this.$refs.nameSelector.pop(this.filePath)
                .then(resp => {
                  resp
                    ? this.savePath = resp
                    : this.exit()
                  this.import()
                })
                .catch(error => {
                  this.error(error)
                })
            } else {
              this.load()
            }
            break

          case 'save':
          case 'autosave':
            this.save(payload)
            break

          case 'exit':
            this.exit()
            break
        }
      }
    })
  },

  methods: {
    ...mapActions(['showMessage']),

    error (error) {
      this.showMessage({
        title: this.$gettext('Error while opening the diagram'),
        desc: error,
        status: 'danger'
      })
    },

    load () {
      this.$client.files.getFileContents(this.filePath, { resolveWithResponseObject: true })
        .then(resp => {
          this.currentETag = resp.headers.ETag
          this.$refs.drawioEditor.contentWindow.postMessage(JSON.stringify({
            action: 'load',
            xml: resp.body,
            autosave: autoSaveEnabled
          }), '*')
        })
        .catch(error => {
          this.error(error)
        })
    },

    import () {
      const url = this.$client.files.getFileUrl(this.filePath)
      const headers = new Headers({
        'Authorization': 'Bearer ' + this.getToken,
        'X-Requested-With': 'XMLHttpRequest'
      })

      // Change the working file after the import
      this.filePath = this.savePath

      fetch(url, { headers })
        .then(resp => {
          // Not setting `currentETag` on imports allows to create new files
          // otherwise the ETag comparison fails with a 412 during the autosave/save event
          // this.currentETag = resp.headers.get('etag')
          return resp.arrayBuffer()
        })
        .then(arrayBuffer => {
          var blob = new Blob([arrayBuffer], { type: 'application/vnd.visio' })
          var reader = new FileReader()
          reader.onloadend = () => {
            this.$refs.drawioEditor.contentWindow.postMessage(JSON.stringify({
              action: 'load',
              xml: reader.result,
              autosave: autoSaveEnabled
            }), '*')
          }
          reader.readAsDataURL(blob)
        })
        .catch(error => {
          this.error(error)
        })
    },

    save (payload) {
      this.$client.files.putFileContents(this.filePath, payload.xml, {
        previousEntityTag: this.currentETag
      }).then((resp) => {
        this.currentETag = resp.ETag
        this.$refs.drawioEditor.contentWindow.postMessage(JSON.stringify({
          action: 'status',
          modified: false
        }), '*')
      }).catch(error => {
        this.error(error)
      })
    },

    exit () {
      window.close()
    }
  }
}
</script>

<style scoped>
#drawio-editor {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  z-index: 999998;
}

</style>
