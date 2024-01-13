export function checkMorningTime() {
  const now = new Date();
  const morningStart = new Date();
  const morningEnd = new Date();

  morningStart.setHours(8, 0, 0, 0);
  morningEnd.setHours(20, 0, 0, 0);

  const randomDays: number[] = [];

  while (randomDays.length < 3) {
    const randomDay = Math.floor(Math.random() * 7); // Números de 0 a 6 (domingo a sábado)

    if (!randomDays.includes(randomDay)) {
      randomDays.push(randomDay);
    }
  }

  return (
    randomDays.includes(now.getDay()) &&
    now >= morningStart &&
    now <= morningEnd
  );
}
