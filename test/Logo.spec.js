import { mount } from '@vue/test-utils'
import snackbar from '@/components/snackbar.vue'

describe('Logo', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(snackbar)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
