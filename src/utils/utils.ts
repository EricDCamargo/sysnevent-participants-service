function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
function formatDateTime(datetime: string): { date: string; time: string } {
  const dateObj = new Date(datetime)
  const date = dateObj.toLocaleDateString('pt-BR')
  const time = dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return { date, time }
}

export { formatDateTime, isValidEmail }
