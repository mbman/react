import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Provider as RendererProvider, ThemeProvider } from 'react-fela'

import {
  callable,
  felaRenderer as felaLtrRenderer,
  felaRtlRenderer,
  toCompactArray,
} from '../../lib'
import {
  ComponentVariables,
  FontFaces,
  IMergedThemes,
  ISiteVariables,
  ITheme,
  StaticStyles,
} from '../../../types/theme'
import ProviderConsumer from './ProviderConsumer'

export interface IProviderProps {
  fontFaces?: FontFaces
  theme: ITheme
  staticStyles?: StaticStyles
  children: React.ReactNode
}

const mergeThemes = (...themes: ITheme[]): IMergedThemes => {
  const [first, ...rest]: ITheme[] = toCompactArray(...themes)

  const merged = {
    siteVariables: first.siteVariables,
    componentVariables: toCompactArray(first.componentVariables),
    componentStyles: toCompactArray(first.componentStyles),
    rtl: first.rtl,
  }

  if (rest.length === 0) {
    return merged
  }

  return rest.reduce((acc, next) => {
    // Site variables can safely be merged at each Provider in the tree.
    // They are flat objects and do not depend on render-time values, such as props.
    acc.siteVariables = { ...acc.siteVariables, ...next.siteVariables }

    // Do not resolve variables in the middle of the tree.
    // Component variables can be objects, functions, or an array of these.
    // The functions must be called with the final result of siteVariables.
    // Component variable objects have no ability to apply siteVariables.
    // Therefore, componentVariables must be resolved by the component at render time.
    // We instead pass down an array of variables to be resolved at the end of the tree.
    if (next.componentVariables) acc.componentVariables.push(next.componentVariables)

    // See component variables reasoning above.
    // (Component styles are just like component variables, except they return style objects.)
    if (next.componentStyles) acc.componentStyles.push(next.componentStyles)

    // Latest RTL value wins
    acc.rtl = next.rtl || acc.rtl

    return acc
  }, merged)
}

/**
 * The Provider passes the CSS in JS renderer and theme down context.
 */
class Provider extends Component<IProviderProps, any> {
  static propTypes = {
    fontFaces: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        paths: PropTypes.arrayOf(PropTypes.string),
        style: PropTypes.shape({
          fontStretch: PropTypes.string,
          fontStyle: PropTypes.string,
          fontVariant: PropTypes.string,
          fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          localAlias: PropTypes.string,
          unicodeRange: PropTypes.string,
        }),
      }),
    ),
    theme: PropTypes.shape({
      siteVariables: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
      componentVariables: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.arrayOf(PropTypes.object),
      ]),
      componentStyles: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
      rtl: PropTypes.bool,
    }),
    staticStyles: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.func])),
    ]),
    children: PropTypes.element.isRequired,
  }

  static Consumer = ProviderConsumer

  renderStaticStyles = felaRenderer => {
    const { theme, staticStyles } = this.props

    if (!staticStyles) return

    const renderObject = object => {
      _.forEach(object, (style, selector) => {
        felaRenderer.renderStatic(style, selector)
      })
    }

    const staticStylesArr = [].concat(staticStyles).filter(Boolean)

    staticStylesArr.forEach(staticStyle => {
      if (typeof staticStyle === 'string') {
        felaRenderer.renderStatic(staticStyle)
      } else if (_.isPlainObject(staticStyle)) {
        renderObject(staticStyle)
      } else if (_.isFunction(staticStyle)) {
        renderObject(staticStyle(theme.siteVariables))
      } else {
        throw new Error(
          `staticStyles array must contain CSS strings, style objects, or rule functions, got: ${typeof staticStyle}`,
        )
      }
    })
  }

  renderFontFaces = felaRenderer => {
    const { fontFaces } = this.props

    if (!fontFaces) return

    const renderFontObject = font => {
      if (!_.isPlainObject(font)) {
        throw new Error(`fontFaces must be objects, got: ${typeof font}`)
      }
      felaRenderer.renderFont(font.name, font.path, font.style)
    }

    fontFaces.forEach(fontObject => {
      renderFontObject(fontObject)
    })
  }

  componentDidMount() {
    const { theme } = this.props
    const felaRenderer = theme.rtl ? felaRtlRenderer : felaLtrRenderer
    this.renderStaticStyles(felaRenderer)
    this.renderFontFaces(felaRenderer)
  }

  render() {
    const { theme, children } = this.props

    console.log('Provider theme', theme)

    // The provider must:
    //   1. Normalize it's theme props, reducing and merging where possible.
    //   2. Merge prop values onto any incoming context values.
    //   3. Provide the result down stream.

    return (
      <ProviderConsumer
        render={(incomingTheme: ITheme | IMergedThemes) => {
          const outgoingTheme: IMergedThemes = mergeThemes(incomingTheme, theme)

          return (
            <RendererProvider renderer={theme.rtl ? felaRtlRenderer : felaLtrRenderer}>
              <ThemeProvider theme={outgoingTheme}>{children}</ThemeProvider>
            </RendererProvider>
          )
        }}
      />
    )
  }
}

export default Provider
