<template>
  <iframe id="drawio-viewer" ref="drawioViewer" :src="iframeSource"/>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import queryString from 'query-string'

var drawioURL = 'https://drawio.web.cern.ch?'

export default {
  name: 'DrawioViewer',
  data: () => ({
    filePath: 'empty',
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
        picker: 0,
        stealth: 1,
        spin: 1,
        proto: 'json',
        //chrome: 0,
        links: 'automatic',
        highlight: '0000ff'
      })

      return drawioURL + query
    }
  },
  created () {
    this.filePath = this.$route.params.filePath

    this.load()
  },
  methods: {
    ...mapActions(['showMessage']),

    load () {
      this.$client.files.getFileContents(this.filePath, { resolveWithResponseObject: true })
        .then(resp => {
          this.currentETag = resp.headers.ETag
          this.$refs.drawioEditor.contentWindow.postMessage(JSON.stringify({
            action: 'load',
            xml: resp.body
          }), '*')
        })
        .catch(error => {
          this.error(error)
        })
    },

    error (error) {
      this.showMessage({
        title: this.$gettext('Error while opening the diagram'),
        desc: error,
        status: 'danger'
      })
    }
  }
}
</script>
<style scoped>
#drawio-viewer {
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
  z-index: 999999;
}

</style>
