

export interface ParsedIneData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  curp?: string;
  birthDate?: string;
  nationality?: string;
}

const CURP_REGEX = /[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d/;

function normalizeLine(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .trim();
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function curpToBirthDate(curp: string): string | null {
  const yy = curp.slice(4, 6);
  const mm = curp.slice(6, 8);
  const dd = curp.slice(8, 10);
  if (!yy || !mm || !dd) return null;

  const homoclave = curp[16];
  const century = /[A-Z]/.test(homoclave) ? 2000 : 1900;
  const year = century + parseInt(yy, 10);

  return `${year}-${mm}-${dd}`;
}

export function parseIneText(rawText: string): ParsedIneData {
  const result: ParsedIneData = { nationality: 'MEX' };

  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const normalizedLines = lines.map(normalizeLine);
  const flatText = normalizeLine(rawText).replace(/\s+/g, '');

  const curpMatch = flatText.match(CURP_REGEX);
  if (curpMatch) {
    result.curp = curpMatch[0];
    const derivedBirthDate = curpToBirthDate(curpMatch[0]);
    if (derivedBirthDate) result.birthDate = derivedBirthDate;
  }


  const birthLabelIdx = normalizedLines.findIndex((line) =>
    line.includes('FECHA DE NACIMIENTO'),
  );
  if (birthLabelIdx !== -1) {
    const candidateLines = [
      normalizedLines[birthLabelIdx],
      normalizedLines[birthLabelIdx + 1],
    ].filter(Boolean);

    for (const line of candidateLines) {
      const dateMatch = line.match(/(\d{2})[/\-.](\d{2})[/\-.](\d{4})/);
      if (dateMatch) {
        const [, dd, mm, yyyy] = dateMatch;
        result.birthDate = `${yyyy}-${mm}-${dd}`;
        break;
      }
    }
  }

  const nombreLabelIdx = normalizedLines.findIndex(
    (line) => line === 'NOMBRE' || line.startsWith('NOMBRE'),
  );
  if (nombreLabelIdx !== -1) {
    const noise =
      /DOMICILIO|CLAVE|CURP|SEXO|FECHA|VIGENCIA|INSTITUTO|REGISTRO|ELECTOR|ESTADO|MUNICIPIO|SECCION|LOCALIDAD|EMISION/;

    const candidates = normalizedLines
      .slice(nombreLabelIdx + 1, nombreLabelIdx + 5)
      .filter((line) => line.length > 1 && !noise.test(line));

    if (candidates[0]) result.lastName = titleCase(candidates[0]);
    if (candidates[1]) result.secondLastName = titleCase(candidates[1]);
    if (candidates[2]) result.firstName = titleCase(candidates[2]);
  }

  return result;
}