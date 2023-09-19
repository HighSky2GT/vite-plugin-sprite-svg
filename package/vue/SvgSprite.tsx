import { computed, defineComponent } from 'vue'
import { type ExtractPropTypes } from 'vue'

const name = 'svg-sprite-component'
export const svgProps = {
  svgName: String,
  preFix: String,
}

export type SvgProps = ExtractPropTypes<typeof svgProps>

export default defineComponent({
  name,
  props: svgProps,
  setup(props) {
    const preFix = props.preFix || 'icon'
    const symbolId = computed(() => `#${preFix}-${props.svgName}`)
    return (
      <svg aria-hidden="true">
        <use href={symbolId.value}/>
      </svg>
    )
  },
})
