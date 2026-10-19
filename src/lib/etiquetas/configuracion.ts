/** Clasificación manual derivada de la hoja "Posicion impresion" del Excel.
 * Validar contra el plano físico antes de activar la impresión automática. */
export type OrientacionEstanteria = "DELANTERA" | "TRASERA";
export type ConfiguracionEtiqueta = {
  posicion: string;
  orientacion: OrientacionEstanteria;
  cantidad: 1 | 2;
  requiereConfirmacion: boolean;
};

const grupos: Record<string, { delanteras: string[]; traseras: string[] }> = {
  XA: {
    delanteras: [
      "XA111", "XA110", "XA109", "XA108", "XA107", "XA106", "XA105", "XA104", "XA103", "XA102",
      "XA101", "XA145", "XA144", "XA143", "XA142", "XA141", "XA140", "XA112", "XA113", "XA114",
      "XA115", "XA116", "XA117", "XA118", "XA150", "XA149", "XA148", "XA147", "XA146", "XA119",
      "XA120", "XA121", "XA122", "XA123", "XA124", "XA155", "XA154", "XA153", "XA152", "XA151",
      "XA125", "XA126", "XA127", "XA128", "XA129", "XA130",
    ],
    traseras: [
      "XA184", "XA185", "XA186", "XA187", "XA188", "XA189", "XA190", "XA191", "XA192", "XA193",
      "XA194", "XA195", "XA196", "XA197", "XA198", "XA199", "XA133", "XA132", "XA131", "XA168",
      "XA169", "XA170", "XA171", "XA172", "XA173", "XA174", "XA175", "XA176", "XA177", "XA178",
      "XA179", "XA180", "XA181", "XA182", "XA183", "XA136", "XA135", "XA134", "XA164", "XA165",
      "XA166", "XA167", "XA139", "XA138", "XA137", "XA156", "XA157", "XA158", "XA159", "XA160",
      "XA161", "XA162", "XA163",
    ],
  },
  XB: {
    delanteras: [
      "XB138", "XB137", "XB136", "XB135", "XB134", "XB101", "XB102", "XB103", "XB104", "XB105",
      "XB106", "XB143", "XB142", "XB141", "XB140", "XB139", "XB107", "XB108", "XB109", "XB110",
      "XB111", "XB112", "XB148", "XB147", "XB146", "XB145", "XB144", "XB113", "XB114", "XB115",
      "XB116", "XB117", "XB118", "XB153", "XB152", "XB151", "XB150", "XB149", "XB119", "XB120",
      "XB121", "XB122", "XB123", "XB124",
    ],
    traseras: [
      "XB156", "XB155", "XB154", "XB127", "XB126", "XB125", "XB159", "XB158", "XB157", "XB130",
      "XB129", "XB128", "XB161", "XB160", "XB133", "XB132", "XB131",
    ],
  },
  XC: {
    delanteras: [
      "XC242", "XC241", "XC240", "XC239", "XC238", "XC101", "XC102", "XC103", "XC104", "XC105",
      "XC106", "XC247", "XC246", "XC245", "XC244", "XC243", "XC107", "XC108", "XC109", "XC110",
      "XC111", "XC112", "XC252", "XC251", "XC250", "XC249", "XC248", "XC113", "XC114", "XC115",
      "XC116", "XC117", "XC118", "XC257", "XC256", "XC255", "XC254", "XC253", "XC119", "XC120",
      "XC121", "XC122", "XC123", "XC124",
    ],
    traseras: [
      "XC263", "XC262", "XC261", "XC260", "XC128", "XC127", "XC126", "XC125", "XC267", "XC266",
      "XC265", "XC264", "XC132", "XC131", "XC130", "XC129", "XC271", "XC270", "XC269", "XC268",
      "XC136", "XC135", "XC134", "XC133", "XC258", "XC273", "XC137", "XC259", "XC274", "XC272",
      "XC275",
    ],
  },
  XD: {
    delanteras: [
      "XD242", "XD241", "XD240", "XD239", "XD238", "XD101", "XD102", "XD103", "XD104", "XD105",
      "XD106", "XD247", "XD246", "XD245", "XD244", "XD243", "XD107", "XD108", "XD109", "XD110",
      "XD111", "XD112", "XD252", "XD251", "XD250", "XD249", "XD248", "XD113", "XD114", "XD115",
      "XD116", "XD117", "XD118", "XD257", "XD256", "XD255", "XD254", "XD253", "XD119", "XD120",
      "XD121", "XD122", "XD123", "XD124",
    ],
    traseras: [
      "XD263", "XD262", "XD261", "XD260", "XD128", "XD127", "XD126", "XD125", "XD267", "XD266",
      "XD265", "XD264", "XD132", "XD131", "XD130", "XD129", "XD271", "XD270", "XD269", "XD268",
      "XD136", "XD135", "XD134", "XD133", "XD258", "XD273", "XD137", "XD259", "XD274", "XD272",
      "XD275",
    ],
  },
  XE: {
    delanteras: [
      "XE242", "XE241", "XE240", "XE239", "XE238", "XE101", "XE102", "XE103", "XE104", "XE105",
      "XE106", "XE247", "XE246", "XE245", "XE244", "XE243", "XE107", "XE108", "XE109", "XE110",
      "XE111", "XE112", "XE252", "XE251", "XE250", "XE249", "XE248", "XE113", "XE114", "XE115",
      "XE116", "XE117", "XE118", "XE257", "XE256", "XE255", "XE254", "XE253", "XE119", "XE120",
      "XE121", "XE122", "XE123", "XE124",
    ],
    traseras: [
      "XE263", "XE262", "XE261", "XE260", "XE128", "XE127", "XE126", "XE125", "XE267", "XE266",
      "XE265", "XE264", "XE132", "XE131", "XE130", "XE129", "XE271", "XE270", "XE269", "XE268",
      "XE136", "XE135", "XE134", "XE133", "XE258", "XE273", "XE137", "XE259", "XE274", "XE272",
      "XE275",
    ],
  },
  XF: {
    delanteras: [
      "XF229", "XF228", "XF227", "XF226", "XF225", "XF101", "XF102", "XF103", "XF104", "XF234",
      "XF233", "XF232", "XF231", "XF230", "XF105", "XF106", "XF107", "XF108", "XF239", "XF238",
      "XF237", "XF236", "XF235", "XF109", "XF110", "XF111", "XF112", "XF244", "XF243", "XF242",
      "XF241", "XF240", "XF113", "XF114", "XF115", "XF116",
    ],
    traseras: [
      "XF248", "XF247", "XF246", "XF245", "XF257", "XF260", "XF263", "XF119", "XF118", "XF117",
      "XF252", "XF251", "XF250", "XF249", "XF258", "XF261", "XF122", "XF121", "XF120", "XF256",
      "XF255", "XF254", "XF253", "XF259", "XF262", "XF124", "XF123",
    ],
  },
  XG: {
    delanteras: [
      "XG118", "XG117", "XG116", "XG115", "XG114", "XG113", "XG101", "XG102", "XG103", "XG124",
      "XG123", "XG122", "XG121", "XG120", "XG119", "XG104", "XG105", "XG106", "XG130", "XG129",
      "XG128", "XG127", "XG126", "XG125", "XG107", "XG108", "XG109", "XG136", "XG135", "XG134",
      "XG133", "XG132", "XG131", "XG110", "XG111", "XG112",
    ],
    traseras: [
      "XG137", "XG138", "XG139",
    ],
  },
  XH: {
    delanteras: [
    ],
    traseras: [
      "XH101", "XH102", "XH103", "XH104", "XH105", "XH106", "XH107", "XH108", "XH109", "XH110",
      "XH111", "XH112", "XH113", "XH114", "XH115", "XH116", "XH117", "XH118", "XH119", "XH120",
      "XH121", "XH122", "XH123", "XH124", "XH125", "XH126", "XH127", "XH128", "XH129", "XH130",
      "XH131", "XH132", "XH133", "XH134", "XH135", "XH136", "XH137", "XH138", "XH139", "XH140",
      "XH141", "XH142", "XH143", "XH144", "XH145", "XH146", "XH147", "XH148", "XH149", "XH150",
      "XH151", "XH152", "XH153", "XH154", "XH155", "XH156", "XH157", "XH158", "XH159", "XH160",
      "XH161", "XH162", "XH163", "XH164", "XH165", "XH166", "XH167", "XH168", "XH169", "XH170",
      "XH171", "XH172", "XH173", "XH174", "XH175", "XH176", "XH177", "XH178", "XH179", "XH180",
      "XH181", "XH182", "XH183", "XH184", "XH185", "XH186", "XH187", "XH188", "XH189", "XH190",
      "XH191", "XH192", "XH193", "XH194", "XH195", "XH196", "XH197", "XH198", "XH199",
    ],
  },
};

export const orientacionesPorPosicion: Record<string, OrientacionEstanteria> = {};
for (const grupo of Object.values(grupos)) {
  for (const codigo of grupo.delanteras) {
    if (orientacionesPorPosicion[codigo]) throw new Error(`Posición duplicada: ${codigo}`);
    orientacionesPorPosicion[codigo] = "DELANTERA";
  }
  for (const codigo of grupo.traseras) {
    if (orientacionesPorPosicion[codigo]) throw new Error(`Posición duplicada: ${codigo}`);
    orientacionesPorPosicion[codigo] = "TRASERA";
  }
}

export function obtenerConfiguracionEtiqueta(posicion: string): ConfiguracionEtiqueta | null {
  const codigo = posicion.trim().toUpperCase();
  const orientacion = orientacionesPorPosicion[codigo];
  if (!orientacion) return null;
  return {
    posicion: codigo,
    orientacion,
    cantidad: orientacion === "DELANTERA" ? 2 : 1,
    requiereConfirmacion: codigo.startsWith("XH"),
  };
}
