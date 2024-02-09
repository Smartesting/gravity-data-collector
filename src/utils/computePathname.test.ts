import { computePathname } from './computePathname'

describe('computePathname', () => {
  it('throws an error if the href is invalid', () => {
    assert.throws(() => computePathname('Youuuu shall not parse!'), 'Invalid URL: Youuuu shall not parse!')
  })

  describe('when there is no hash in the pathname', () => {
    it('returns the pathname as parsed by URL', () => {
      assert.deepStrictEqual(computePathname('http://plic.com'), '/')
      assert.deepStrictEqual(computePathname('http://plic.com/'), '/')
      assert.deepStrictEqual(computePathname('http://plic.com/ploc'), '/ploc')
    })
  })

  describe('when there is a hash in the pathname', () => {
    it('considers the hash as the pathname, minus the # sign', () => {
      assert.deepStrictEqual(computePathname('http://plic.com/#'), '/')
      assert.deepStrictEqual(computePathname('http://plic.com/#/'), '/')
      assert.deepStrictEqual(computePathname('http://plic.com/#/ploc'), '/ploc')
    })

    describe('when there is a pathname too', () => {
      it('rebuilds the pathname from both the "real" one and the hash', () => {
        assert.deepStrictEqual(computePathname('http://plic.com/myApp/#/ploc'), '/myApp/ploc')
        assert.deepStrictEqual(computePathname('http://plic.com/myApp/#/ploc/'), '/myApp/ploc/')
      })
    })
  })

  it('does not take search into account', () => {
    assert.deepStrictEqual(computePathname('http://plic.com?q=1'), '/')
    assert.deepStrictEqual(computePathname('http://plic.com/#/ploc?q=2'), '/ploc')
    assert.deepStrictEqual(computePathname('http://plic.com/myApp/#/ploc/?q=3'), '/myApp/ploc/')
  })
})
