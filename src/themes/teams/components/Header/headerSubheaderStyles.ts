import { pxToRem } from '../../../../lib'
import { ICSSInJSStyle } from '../../../../../types/theme'

export default {
  root: (): ICSSInJSStyle => ({
    fontSize: pxToRem(21.428),
    lineHeight: pxToRem(22),
    color: 'rgba(0,0,0,.6)',
    fontWeight: 400,
  }),
}
