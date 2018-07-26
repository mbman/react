import { ICSSInJSStyle } from '../../../../../types/theme'

export default {
  root: ({ props }): ICSSInJSStyle => ({
    textAlign: props.textAlign,
    display: 'block',
  }),
}
