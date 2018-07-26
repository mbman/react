import { pxToRem } from '../../lib'
import { IImageVariables } from './imageVariables'

export default {
  root: ({ props, variables: v }: { props: any; variables: IImageVariables }) => ({
    display: 'inline-block',
    verticalAlign: 'middle',
    width: v.width,
    height: v.height,
    ...(props.circular && { borderRadius: pxToRem(9999) }),
    ...(props.avatar && {
      width: v.avatarSize,
      borderRadius: v.avatarRadius,
    }),
  }),
}
