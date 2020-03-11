<template>
  <div class="dialog" v-if="active">
    <div class="elements-box">
      <h2>New file name</h2>
      <hr/>
      <div class="input-container">
        <input id="namefield" type="text" v-model="fileName" placeholder="File Name" />
        <b id="extension">.drawio</b>
      </div>
      <label for="namefield" class="error-tip" v-if="errorMessage">{{errorMessage}}</label>
      <div class="buttons-box">
        <button @click="cancel" class="cancel-button">Cancel</button>
        <button @click="accept" class="accept-button" :disabled="errorMessage">Accept</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      resolve: () => null,
      fileName: '',
      existingFiles: null,
      active: false
    }
  },

  computed: {
    errorMessage () {
      return this.isValidName()
    }
  },

  created () {
    this.$client.files.list('')
      .then(files => {
        this.existingFiles = files.map(file => file.name)
      })
  },

  methods: {
    pop (fileName) {
      this.fileName = fileName.substr(1)
      return new Promise((resolve, reject) => {
        this.active = true
        this.resolve = resolve
      })
    },

    accept () {
      this.dismiss()
      this.resolve(!this.isValidName() ? this.fileName + '.drawio' : null)
    },

    cancel () {
      this.dismiss()
      this.resolve(null)
    },

    dismiss () {
      this.active = false
    },

    isValidName () {
      if (!this.fileName)
        return 'Filename cannot be empty'

      if (/[/]/.test(this.fileName))
        return 'File name cannot contain "/"'

      if (this.fileName === '.')
        return 'File name cannot be equal to "."'

      if (this.fileName === '..')
        return 'File name cannot be equal to ".."'

      if (/\s+$/.test(this.fileName))
        return 'File name cannot end with whitespace'

      if (this.existingFiles.includes('/' + this.fileName + '.drawio'))
        return 'A file with this name already exists'

      else
        return null
    }
  }
}
</script>

<style scoped>
*
{
    box-sizing:         border-box;
    -moz-box-sizing:    border-box;
    -webkit-box-sizing: border-box;
    z-index: 999999;
}

.dialog
{
  width: 300px;
  margin: 100px auto;
  position: relative;
  background: #fff;
  overflow: hidden;
  box-shadow:         0 1px 3px 0 rgba(0,0,0,0.186);
  -moz-box-shadow:    0 1px 3px 0 rgba(0,0,0,0.186);
  -webkit-box-shadow: 0 1px 3px 0 rgba(0,0,0,0.186);
  border-radius:         5px;
  -moz-border-radius:    5px;
  -webkit-border-radius: 5px;
}

h2 {
  margin: 0px;
}

hr {
  margin-top: 0px;
  margin-bottom: 5px;
}

.input-container {
  display: -ms-flexbox; /* IE10 */
  display: flex;
  width: 100%;
  margin-bottom: 15px;
}

button
{
  width: 100%;
  height: 40px;
  border-radius:         3px;
  -moz-border-radius:    3px;
  -webkit-border-radius: 3px;
  border: 1px solid #dee3e4;
  padding: 3px 12px;
  margin: 6px 0;
  display: inline-block;
}

#namefield {
  height: 40px;
  flex: 1;
  min-width: 120px;
  outline: none;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  border: 1px solid #dee3e4;
  border-right: 0px;
  padding: 3px 12px;
  margin: 6px 0;
}

#extension {
  height: 40px;
  display: flex;
  align-items: center;
  background: #dee3e4;
  text-align: center;
  font-weight: bold;
  font-family: "Times New Roman", Times, serif;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  border: 1px solid #dee3e4;
  border-left: 0px;
  padding: 3px 12px;
  margin: 6px 0;
}

#namefield:focus
{
  outline: none;
  border: 1px solid #03b3b5;
  border-right: 0px;
  transition:         all .5s ease-in-out;
  -o-transition:      all .5s ease-in-out;
  -moz-transition:    all .5s ease-in-out;
  -webkit-transition: all .5s ease-in-out;
}

#namefield:focus + #extension
{
  outline: none;
  border: 1px solid #03b3b5;
  border-left: 0px;
  transition:         all .5s ease-in-out;
  -o-transition:      all .5s ease-in-out;
  -moz-transition:    all .5s ease-in-out;
  -webkit-transition: all .5s ease-in-out;
}

.elements-box
{
  width: 100%;
  border-radius:         5px;
  -moz-border-radius:    5px;
  -webkit-border-radius: 5px;
  padding: 20px 40px;
  right: 0px;
}

.buttons-box {
  text-align: right;
}

button
{
  width: 40%;
  text-align: center;
  line-height: 30px;
  opacity: 0.95;
  cursor: pointer;
}

button:disabled
{
  color: #666666;
  background: #bbbbbb;
}

button:hover{opacity: 1}

.accept-button
{
  color: #333;
  background: #03b3b5;
}

.cancel-button
{
  color: #333;
  background: #FFFFFF;
}

/* Tooltip Styling */
.error-tip {
  background-color: #fce4e4;
  border: 1px solid #fcc2c3;
  border-radius: 7px;
  -moz-border-radius: 7px;
  -webkit-border-radius: 7px;
  display: inline-block;
  color: #cc0033;
  font-weight: bold;
  font-size: 10px;
  line-height: 24px;
  position: relative;
  padding: 2px 8px 2px;
}

.error-tip:after, .error-tip:before {
    bottom: 100%;
    left: 50%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }

.error-tip:after {
  border-color: rgba(252, 228, 228, 0);
  border-bottom-color: #fce4e4;
  border-width: 10px;
  margin-left: -10px;
}

.error-tip:before {
  border-color: rgba(252, 194, 195, 0);
  border-bottom-color: #fcc2c3;
  border-width: 11px;
  margin-left: -11px;
}

.arrow_box {
  position: relative;
  background: #fce4e4;
  border: 1px solid #fcc2c3;
}
.arrow_box:after, .arrow_box:before {
  bottom: 100%;
  left: 50%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.arrow_box:after {
  border-color: rgba(252, 228, 228, 0);
  border-bottom-color: #fce4e4;
  border-width: 10px;
  margin-left: -10px;
}
.arrow_box:before {
  border-color: rgba(252, 194, 195, 0);
  border-bottom-color: #fcc2c3;
  border-width: 11px;
  margin-left: -11px;
}

</style>
