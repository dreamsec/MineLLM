/**
 * 格式化数字，保留指定小数位
 * @param value 输入的值
 * @param precision 保留的小数位数，默认2位
 * @returns 格式化后的字符串，如果无效则返回 '--'
 */
export const formatDecimal = (value: number | string | null | undefined, precision: number = 2): string => {
  if (value === null || value === undefined || value === '') {
    return '--'
  }

  const num = Number(value)
  // 如果转换结果不是数字 (NaN)，或者是布尔值(视需求而定，这里Number(true)会是1，如果不想处理布尔值可以加 typeof 判断)
  // 考虑到你的数据主要是物理量，Number转换通常是安全的
  if (isNaN(num)) {
    return String(value)
  }

  return num.toFixed(precision)
}
