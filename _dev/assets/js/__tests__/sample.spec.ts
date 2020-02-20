const sample = (a: number, b: number): number => {
  return a + b
}

test('sample test', (): void => {
  expect(sample(1, 2)).toBe(3)
})
