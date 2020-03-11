import 'core-js/stable'
import 'regenerator-runtime/runtime'

import translationsJson from '../l10n/translations'
import DrawioEditor from './DrawioEditor.vue'
import DrawioViewer from './DrawioViewer.vue'
import NameSelector from './NameSelector.vue'

const routes = [
  {
    name: 'drawio-edit',
    path: '/edit/:filePath',
    components: {
      fullscreen: DrawioEditor
    },
    meta: {
      hideHeadbar: true
    }
  }
]

const appInfo = {
  name: 'draw.io',
  id: 'drawio',
  icon: 'grid_on',
  isFileEditor: true,
  extensions: [
    {
      extension: 'drawio',
      newTab: true,
      routeName: 'drawio-edit',
      newFileMenu: {
        menuTitle ($gettext) {
          return $gettext('New draw.io diagram')
        }
      }
    },
    {
      extension: 'vsdx',
      newTab: true,
      routeName: 'drawio-edit'
    }
  ]
}

const translations = translationsJson
export default define({
  appInfo,
  routes,
  translations
})
