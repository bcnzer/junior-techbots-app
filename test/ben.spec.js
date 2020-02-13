// describe('Google', () => {
//   beforeAll(async () => {
//     await page.goto('https://google.com')
//   })

//   it('should be titled "Google"', async () => {
//     await expect(page.title()).resolves.toMatch('Google')
//   })
// })

describe('Timely', () => {
  beforeAll(async () => {
    await page.goto('https://www.gettimely.com/pricing/')
  })

  it('should allow me to click', async () => {
    const btn = await page.$x("//a[contains(text(), 'Careers')]")

    if (btn.length > 0) {
      await btn[0].click()
      console.log('found it!')
    } else {
      throw new Error('Link not found')
    }
  })

  it('should be titled "Pricing | Timely"', async () => {
    await expect(page.title()).resolves.toMatch('Careers | Timely Salon &amp; Spa Software')
  })
})
