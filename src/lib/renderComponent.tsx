import _ from 'lodash'
import cx from 'classnames'
import { combineRules } from 'fela'
import React from 'react'
import { FelaTheme } from 'react-fela'

// import getClasses from './getClasses'
import getElementType from './getElementType'
import getUnhandledProps from './getUnhandledProps'
import callable from './callable'
import reduceArrayOfArrays from './reduceArrayOfArrays'
import combineArrayOfCallables from './combineArrayOfCallables'
import {
  ComponentVariables,
  ComponentVariablesFunction,
  ComponentVariablesObject,
  IComponentClasses,
  IComponentStyles,
  IMergedThemes,
  ITheme,
} from '../../types/theme'
import renderer from './felaRenderer'

export interface IRenderResultConfig<P> {
  ElementType: React.ReactType<P>
  rest: { [key: string]: any }
  classes: { [key: string]: string }
}

export type RenderComponentCallback<P> = (config: IRenderResultConfig<P>) => any

export interface IRenderConfig {
  className?: string
  defaultProps?: { [key: string]: any }
  displayName?: string
  handledProps: string[]
  props: { [key: string]: any }
}

const renderComponent = <P extends {}>(
  config: IRenderConfig,
  render: RenderComponentCallback<P>,
): React.ReactNode => {
  const { className, defaultProps, displayName, handledProps, props } = config

  return (
    <FelaTheme
      render={(theme: ITheme | IMergedThemes) => {
        const { siteVariables, componentVariables, componentStyles, rtl } = theme
        console.log('renderComponent: theme =', theme)
        const ElementType = getElementType({ defaultProps }, props)
        const rest = getUnhandledProps({ handledProps }, props)

        //
        // Resolve variables using final siteVariables, allow props to override
        //
        const variablesOnContext: ComponentVariables[] = reduceArrayOfArrays(
          componentVariables,
          displayName,
        )
        const variablesProps: ComponentVariables = props.variables

        const variablesFunctionOnProps: ComponentVariablesFunction = callable(variablesProps)

        const variables: ComponentVariablesObject = {
          ...combineArrayOfCallables(variablesOnContext, siteVariables),
          ...variablesFunctionOnProps(siteVariables),
        }

        //
        // Resolve styles using resolved variables, merge results, allow props to override
        //

        // TODO: this is (can be) a IMergedThemes, handle styles which might be arrays
        // TODO: use toCompactArray
        const stylesOnContextArr: IComponentStyles[] = reduceArrayOfArrays(
          componentStyles,
          displayName,
        )
        const stylesOnContext: IComponentStyles = combineArrayOfCallables(
          stylesOnContextArr,
          displayName,
        )
        const stylesOnProps: IComponentStyles = props.styles || {}

        const componentParts = _.union(_.keys(stylesOnContext), _.keys(stylesOnProps))
        const ruleProps = { props, variables, siteVariables, rtl }
        const { renderRule } = renderer

        const classes: IComponentClasses = componentParts.reduce((acc, partName) => {
          const contextRule = callable(stylesOnContext[partName])
          const propRule = callable(stylesOnProps[partName])

          const rule =
            contextRule && propRule ? combineRules(contextRule, propRule) : contextRule || propRule

          acc[partName] = renderRule(rule, ruleProps)

          console.log('renderComponent: classes =', { partName, rule, result: acc[partName] })

          return acc
        }, {})

        classes.root = cx(className, classes.root, props.className)

        console.log(`renderComponent: ${displayName} result =`, {
          stylesOnContext,
          stylesOnProps,
          className,
        })
        console.groupEnd()

        // const classes = getClasses(props, styles, variables, siteVariables, rtl)
        // classes.root = cx(className, classes.root, props.className)

        const config: IRenderResultConfig<P> = { ElementType, rest, classes }

        return render(config)
      }}
    />
  )
}

export default renderComponent
