import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, userAccess } from "@/lib/schema";
import { eq } from "drizzle-orm";

const data = [
	{
		"BIL": "1",
		"NAMA PENUH": "YBhg. Datuk Suhaimi bin Sulaiman",
		"JAWATAN": "Ketua Pengarah",
		"EMEL": "suhaimisulaiman@rtm.gov.my",
		"USER ID": "KPRTM",
		"PERANAN TUGAS": "Management",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "2",
		"NAMA PENUH": "Encik Hamzah bin Isyak",
		"JAWATAN": "Timbalan Ketua Pengarah Penyiaran Strategik (TKPPS)",
		"EMEL": "hamzah@rtm.gov.my",
		"USER ID": "TKPPS",
		"PERANAN TUGAS": "Management",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "3",
		"NAMA PENUH": "Encik Ismail bin Sulaiman",
		"JAWATAN": "Timbalan Ketua Pengarah Operasi Penyiaran (TKPOP)",
		"EMEL": "ismails@rtm.gov.my",
		"USER ID": "TKPOP",
		"PERANAN TUGAS": "Management",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "4",
		"NAMA PENUH": "Puan Latipah binti Md Zubir",
		"JAWATAN": "Timbalan Pengarah Bahagian Pemasaran dan Promosi (BPP)",
		"EMEL": "latipah@rtm.gov.my",
		"USER ID": "BPP 01",
		"PERANAN TUGAS": "Marketing 01",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "5",
		"NAMA PENUH": "Puan Farahiah binti Mohd Zubir",
		"JAWATAN": "Ketua Penolong Pengarah Bahagian Pemasaran dan Promosi (BPP)",
		"EMEL": "farahiah@rtm.gov.my",
		"USER ID": "BPP 02",
		"PERANAN TUGAS": "Marketing 02",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "6",
		"NAMA PENUH": "Encik Shaheezam bin Said",
		"JAWATAN": "Pengarah Media Digital dan Interaktif (MDI)",
		"EMEL": "shaheezam@rtm.gov.my",
		"USER ID": "MDI 01",
		"PERANAN TUGAS": "BOS MDI",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "7",
		"NAMA PENUH": "Encik Mohd Fadli bin Othman",
		"JAWATAN": "Penolong Pengarah Media Digital dan Interaktif (MDI)",
		"EMEL": "fadli@rtm.gov.my",
		"USER ID": "MDI-MEDSOS",
		"PERANAN TUGAS": "MDI-MEDSOS",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "8",
		"NAMA PENUH": "Dr. Mohd Zaidi bin Abu Seman",
		"JAWATAN": "Ketua Unit OTT, Media Digital dan Interaktif (MDI)",
		"EMEL": "mohdzaidi@rtm.gov.my",
		"USER ID": "MDI-OTT",
		"PERANAN TUGAS": "MDI-OTT",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "9",
		"NAMA PENUH": "Encik Reza Shariman bin Othman",
		"JAWATAN": "Pengarah Bahagian Program TV (BPTV)",
		"EMEL": "alexreza@rtm.gov.my",
		"USER ID": "BTV 01",
		"PERANAN TUGAS": "BOS TV",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "10",
		"NAMA PENUH": "Encik Nasrul Hakim bin Md Noh",
		"JAWATAN": "Timbalan Pengarah Seksyen Produksi TV",
		"EMEL": "hakim@rtm.gov.my",
		"USER ID": "BTV 02",
		"PERANAN TUGAS": "TV-Production",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "11",
		"NAMA PENUH": "Encik Zairul Eizam bin Abdul Rahman",
		"JAWATAN": "Penerbit Rancangan Saluran TV1",
		"EMEL": "zairuleizam@rtm.gov.my",
		"USER ID": "TV1",
		"PERANAN TUGAS": "TV1",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "12",
		"NAMA PENUH": "Puan Hafizah Nur Syahirah binti Abdullah",
		"JAWATAN": "Penerbit Rancangan Saluran TV2",
		"EMEL": "hnsyahirah@rtm.gov.my",
		"USER ID": "TV2",
		"PERANAN TUGAS": "TV2",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "13",
		"NAMA PENUH": "Puan Hartini binti Haris",
		"JAWATAN": "Penolong Pengurus Saluran TV2",
		"EMEL": "hartiniharis@rtm.gov.my",
		"USER ID": "TV2",
		"PERANAN TUGAS": "TV2",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "14",
		"NAMA PENUH": "Puan Najwa Liyana binti Ramlan",
		"JAWATAN": "Penerbit Rancangan Saluran OKEY",
		"EMEL": "najwaliyana@rtm.gov.my",
		"USER ID": "OKEY",
		"PERANAN TUGAS": "OKEY",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "15",
		"NAMA PENUH": "Puan Siti Nur Akmar binti Mohd Yusof",
		"JAWATAN": "Penerbit Rancangan Saluran SUKAN",
		"EMEL": "akmaryusof@rtm.gov.my",
		"USER ID": "SUKAN RTM",
		"PERANAN TUGAS": "SUKAN RTM",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "16",
		"NAMA PENUH": "Puan Dayang Nazirah",
		"JAWATAN": "Penerbit Rancangan Seksyen Penyelarasan Program TV",
		"EMEL": "dayangnazihah@rtm.gov.my",
		"USER ID": "TV-OTT",
		"PERANAN TUGAS": "DATA TV",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "17",
		"NAMA PENUH": "Encik Md Shahri bin Saripan",
		"JAWATAN": "Pengarah Bahagian Berita Ehwal Semasa (BES)",
		"EMEL": "shahri@rtm.gov.my",
		"USER ID": "BES",
		"PERANAN TUGAS": "BOS BERITA",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "18",
		"NAMA PENUH": "Fauziah binti Mohd Sidek",
		"JAWATAN": "Penerbit Rancangan Unit Media Baharu",
		"EMEL": "fauziah.ms@rtm.gov.my",
		"USER ID": "BES-MEDSOS",
		"PERANAN TUGAS": "BES-MEDSOS",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "19",
		"NAMA PENUH": "Encik Mat Yunus bin Sabri",
		"JAWATAN": "Ketua Unit Penolong Penyuntingan Berita",
		"EMEL": "matyunus@rtm.gov.my",
		"USER ID": "BES-PORTAL",
		"PERANAN TUGAS": "BES-PORTAL",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "20",
		"NAMA PENUH": "Ts. Nurulhusna binti Mohamad Kasim",
		"JAWATAN": "Ketua Penolong Pengarah Seksyen Teknologi Aplikasi (MTA)",
		"EMEL": "nurulhusna@rtm.gov.my",
		"USER ID": "MTA",
		"PERANAN TUGAS": "MTA",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "21",
		"NAMA PENUH": "Puan Norashikin binti Samsudin",
		"JAWATAN": "Penolong Jurutera Seksyen Teknologi Aplikasi (MTA)",
		"EMEL": "ashikin@rtm.gov.my",
		"USER ID": "MTA-OTT",
		"PERANAN TUGAS": "MTA-OTT",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "22",
		"NAMA PENUH": "Encik Saifuzzaman bin Yusop",
		"JAWATAN": "Pengarah Bahagian Program Radio (BPR)",
		"EMEL": "saifuzz@rtm.gov.my",
		"USER ID": "RADIO",
		"PERANAN TUGAS": "BOS RADIO",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "23",
		"NAMA PENUH": "Puan Noor Hajjar binti Abdul Malek",
		"JAWATAN": "Penerbit Rancangan Seksyen Penyelarasan & Penjadualan Radio",
		"EMEL": "noorhajjar@rtm.gov.my",
		"USER ID": "RADIO-MEDSOS",
		"PERANAN TUGAS": "RADIO-MEDSOS",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "24",
		"NAMA PENUH": "Puan Norhaslinda binti Hassim",
		"JAWATAN": "Penerbit Rancangan Seksyen Penyelarasan & Penjadualan Radio",
		"EMEL": "linda.hashim@rtm.gov.my",
		"USER ID": "RADIO-OTT",
		"PERANAN TUGAS": "DATA RADIO",
		"PERANAN DALAM SISTEM": "USER"
	},
	{
		"BIL": "25",
		"NAMA PENUH": "Puan Mazlina binti Mohd Yusoff",
		"JAWATAN": "Ketua Penolong Pengarah Seksyen Perancangan Strategik (SPS)",
		"EMEL": "mazlinamy@rtm.gov.my",
		"USER ID": "STRATEGIK 01",
		"PERANAN TUGAS": "PIC MEDINA",
		"PERANAN DALAM SISTEM": "ADMIN"
	},
	{
		"BIL": "26",
		"NAMA PENUH": "Puan Denise Chew Sze Fern",
		"JAWATAN": "Penolong Pengarah Seksyen Dasar dan Penyelidikan (SDDP)",
		"EMEL": "denise@rtm.gov.my",
		"USER ID": "STRATEGIK 02",
		"PERANAN TUGAS": "PIC MEDINA",
		"PERANAN DALAM SISTEM": "ADMIN"
	},
	{
		"BIL": "27",
		"NAMA PENUH": "Cik Siti Ruqaiyah binti Haji Hashim",
		"JAWATAN": "Penerbit Rancangan (K) Seksyen Perancangan Strategik (SPS)",
		"EMEL": "ruqaiyah.rtm@gmail.com",
		"USER ID": "STRATEGIK 03",
		"PERANAN TUGAS": "PIC DATA",
		"PERANAN DALAM SISTEM": "ADMIN"
	},
	{
		"BIL": "28",
		"NAMA PENUH": "Encik Azmi bin Ahmad",
		"JAWATAN": "Ketua Penolong Pengarah Seksyen Penyiaran Multichannel (SPMC)",
		"EMEL": "azmi@rtm.gov.my",
		"USER ID": "ICP 01",
		"PERANAN TUGAS": "PIC ICP",
		"PERANAN DALAM SISTEM": "ADMIN"
	},
	{
		"BIL": "29",
		"NAMA PENUH": "Ts. Mohd Zaidi bin Zainon",
		"JAWATAN": "Penolong Pengarah Seksyen Penyiaran Multichannel (SPMC)",
		"EMEL": "zaidizainon@rtm.gov.my",
		"USER ID": "ICP 02",
		"PERANAN TUGAS": "PIC ICP",
		"PERANAN DALAM SISTEM": "ADMIN"
	},
	{
		"BIL": "30",
		"NAMA PENUH": "Ts. Ahmad Shaiful Redha bin Razak",
		"JAWATAN": "Penolong Pengarah Seksyen Teknikal Rangkaian (STR)",
		"EMEL": "ahmadshaiful@rtm.gov.my",
		"USER ID": "ICP 03",
		"PERANAN TUGAS": "PIC ICP",
		"PERANAN DALAM SISTEM": "ADMIN"
	}
]

for (const user of data) {
  const name = user["NAMA PENUH"];
  const email = user["EMEL"];
  const password = email; // Using email as password for initial setup
  const position = user["JAWATAN"];
  const systemId = user["USER ID"];
  const taskRole = user["PERANAN TUGAS"];
  const role = user["PERANAN DALAM SISTEM"].toLowerCase();
  console.log(`Adding user: ${name} (${email}) with ID: ${systemId} as ${role}`);

   const signUpResult = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  console.log(`User added: ${data.name} (${data.email}) with ID: ${data.systemId} as ${data.role}`);;
}