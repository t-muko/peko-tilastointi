import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { makeObservable, observable, action, reaction, runInAction } from 'mobx';
import { FirebaseContext } from '@components/Firebase/Firebase';
import { Collection, Document } from 'firestorter';
import { CircularProgress } from "@mui/material";
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { TextField } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';

import { Paper, Dialog } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Chart } from "react-google-charts";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTheme, type Theme } from '@mui/material/styles';
import { buildHashtagStats, type ReeniForHashtagStats } from '../utils/hashtagStats';
import { isValidAkm } from '../utils/akmStats';
import { REENI_CATEGORIES } from '../constants/reeniCategories';

import moment from 'moment';
import 'moment/locale/fi';
moment.locale('fi')

const jasenjarjestot = [
	{ label: '' },
	{ label: '100SAR ry' },
	{ label: 'Action Dogs' },
	{ label: 'Action ry' },
	{ label: 'Agility.ax rf' },
	{ label: 'Aktiivicolliet ry' },
	{ label: 'Aktiivikoirat ry' },
	{ label: 'Anjalankosken Palveluskoirayhdistys ry' },
	{ label: 'Askola Country Dogs ry' },
	{ label: 'Auran Nuuskut ry' },
	{ label: 'Australianpaimenkoirat ry' },
	{ label: 'Bullenbeisser-Klubi ry' },
	{ label: 'Bullmastiffit ja Mastiffit ry' },
	{ label: 'Cane Corso Club Finland ry' },
	{ label: 'Citybelgit ry' },
	{ label: 'Close-Knit Team ry' },
	{ label: 'Cockeriharrastajat ry' },
	{ label: 'Dalmatiankoirat ry' },
	{ label: 'Dobermann Team Turku ry' },
	{ label: 'Dogo Argentino Club Finland ry' },
	{ label: 'Enjoy the Ride ry' },
	{ label: 'Espoon Koirakerho ry' },
	{ label: 'Espoon Palveluskoiraklubi ry' },
	{ label: 'Espoon Pelastuskoirayhdistys ry - Esbo Räddningshundsförening rf (ESPY)' },
	{ label: 'Etelä-Hämeen Koirakerho ry' },
	{ label: 'Etelä-Hämeen Rottweilerkerho ry' },
	{ label: 'Etelä-Pirkanmaan Pelastuskoirat EPPeko ry' },
	{ label: 'Etelä-Pohjanmaan Koiraklubi ry' },
	{ label: 'Etelä-Savon Etsintäkoirat ry (ESEK)' },
	{ label: 'Etelä-Suomen Palveluskoira ry' },
	{ label: 'Etelä-Suomen Ruttukuonokerho' },
	{ label: 'Etelärannikon Tassutiimi ry' },
	{ label: 'Forssan Palveluskoirat' },
	{ label: 'Forssan Seudun Pelastuskoirat ry (FoSePeKo)' },
	{ label: 'H H Haku Hurtat ry' },
	{ label: 'Haapaveden Kennelseura ry' },
	{ label: 'Hakunilan Seudun Koiraharrastajat ry' },
	{ label: 'Haminan Pelastuskoiraharrastajat ry (HPKH)' },
	{ label: 'Hangö Kennelklubb rf - Hangon Kennelkerho ry' },
	{ label: 'Hankasalmen Kennelkerho ry' },
	{ label: 'Harjavallan Palvelus- ja Seurakoiraharrastajat ry' },
	{ label: 'Hausjärven Haukut ry' },
	{ label: 'Heinolan Palvelus- ja Seurakoira ry' },
	{ label: 'Helsingin Palveluskoiraharrastajat ry' },
	{ label: 'Helsingin Vetokoirakerho ry' },
	{ label: 'Helsingin Väestönsuojeluyhdistys/HEPeKo' },
	{ label: 'High Five Agility Team ry' },
	{ label: 'Hiiden Haukut ry' },
	{ label: 'Hollolan Koiraharrastajat ry' },
	{ label: 'Huittisten Seudun Koirayhdistys ry' },
	{ label: 'Hundklubben Koirakerho Canidae ry' },
	{ label: 'Hyvinkään Koiraurheilijat ry' },
	{ label: 'Hyvinkään Käyttökoirat ry' },
	{ label: 'Hyvinkään seudun Kennelkerho ry' },
	{ label: 'Hyvänmielen Koiraharrastajat ry' },
	{ label: 'Hämeen Hakukoirat ry' },
	{ label: 'Hämeen Koiraharrastajat ry' },
	{ label: 'Hämeenlinnan Etsintäkoirat ry' },
	{ label: 'Hämeenlinnan Kennelkerho ry' },
	{ label: 'Hämeenlinnan seudun Pelastuskoirat ry (Hämpet)' },
	{ label: 'Iisalmen Seudun Käyttö- ja Seurakoirayhdistys ry' },
	{ label: 'Ikaalisten Seudun Kennelkerho RT/T ry' },
	{ label: 'Imatran Palveluskoirayhdistys ry' },
	{ label: 'Impivaaran Hallit ry' },
	{ label: 'Ipo-Klubi ry' },
	{ label: 'Itä-Helsingin Agilityharrastajat ry' },
	{ label: 'Itä-Hämeen Etsintäkoirat ry (IHEK)' },
	{ label: 'Jalasjärven Koiraharrastajat ry' },
	{ label: 'Janakkalan Koirakerho ry' },
	{ label: 'Joensuun Agilityurheilijat ry' },
	{ label: 'Joensuun Seudun Palveluskoirayhdistys ry' },
	{ label: 'Jokelan Seudun Koirakerho ry' },
	{ label: 'Jokivarren Rallykoirat ry' },
	{ label: 'Joutsan Koiraharrastajat ry' },
	{ label: 'Jämsän Seudun Palveluskoiraharrastajat ry' },
	{ label: 'Järvenpään Koirakerho ry' },
	{ label: 'Järviseudun kennelkerho ry' },
	{ label: 'K9 Itä-Suomi ry (K9 Itä)' },
	{ label: 'K9 Keski-Suomi ry' },
	{ label: 'K9 Pirkanmaa ry' },
	{ label: 'K9 Uusimaa ry (K9U)' },
	{ label: 'Kaakon Agility Klubi ry' },
	{ label: 'Kaakon Käyttökoirat ry' },
	{ label: 'Kaarinan Koiraharrastajat ry' },
	{ label: 'Kainuun Palveluskoirayhdistys ry' },
	{ label: 'Kainuun pelastuskoirat ry (KAPEKO)' },
	{ label: 'Kainuun Seurakoira- ja Terrierikerho ry' },
	{ label: 'Kanavan Koirakilta ry' },
	{ label: 'Kangasniemen Kennelkerho ry' },
	{ label: 'Kankaanpään Seudun Kennelyhdistys ry' },
	{ label: 'Kannuksen Koiruudet ry' },
	{ label: 'Karhuseudun Etsintäkoirat ry (KarSeE)' },
	{ label: 'Karjalan Palveluskoiraharrastajat ry' },
	{ label: 'Kauhajoen Koiraharrastajat ry' },
	{ label: 'Kauhavan Kennelkerho ry' },
	{ label: 'Kauniaisten Pelastuskoirat ry' },
	{ label: 'Kaustisenseudun Koiraharrastajat ry' },
	{ label: 'Kemin Koiraharrastajat ry' },
	{ label: 'Kemin Seura- ja Palveluskoirakerho ry' },
	{ label: 'Keravan Koiraharrastajat ry' },
	{ label: 'Kerry- ja vehnäterrierikerho ry' },
	{ label: 'Keski-Karjalan Palveluskoirat ry' },
	{ label: 'Keski-Pohjanmaan Koirakilta ry' },
	{ label: 'Keski-Pohjanmaan Palveluskoirat ry' },
	{ label: 'Keski-Suomen Palveluskoirayhdistys ry' },
	{ label: 'Keski-Suomen Pelastuskoirat ry (KesPek)' },
	{ label: 'Keski-Uudenmaan hälytyskoirat ry (KeHä)' },
	{ label: 'Keuruun Seudun Kennelkerho ry' },
	{ label: 'Kirkkonummen Kennelkerho ry' },
	{ label: 'Kiteen Kennelkerho ry' },
	{ label: 'Kitka ry' },
	{ label: 'Koillismaan Koirakerho ry' },
	{ label: 'Koirakerho Tassut ry' },
	{ label: 'Koiratiimi ry' },
	{ label: 'Koirien Saarijärvi ry' },
	{ label: 'KoKo ry' },
	{ label: 'Kotkan Koiraystäväin Seura ry' },
	{ label: 'Kotkan Pelastuskoirayhdistys ry (KPK)' },
	{ label: 'Kouvolan Etsintäkoirat ry (KoE)' },
	{ label: 'Kouvolan Palveluskoirayhdistys ry' },
	{ label: 'Kouvolan Pelastuskoirat ry' },
	{ label: 'Kouvolan Seudun Seurakoirakerho ry' },
	{ label: 'Kristiinanseudun Koiraharrastajat ry' },
	{ label: 'Kukkian Haukut' },
	{ label: 'Kultainen Rengas - Golden Ring ry' },
	{ label: 'Kuopion Palvelus- ja Seurakoiraharrastajat ry' },
	{ label: 'Kuopion Pelastuskoirat ry' },
	{ label: 'Kuusamon Pelastuskoirat ry (KuPe)' },
	{ label: 'Kymen Vetokoiraseura ry' },
	{ label: 'Kymenlaakson Etsintäkoirat ry (KEK)' },
	{ label: 'Kyrönmaan Koiraharrastajat' },
	{ label: 'Kyröskosken Käyttökoirat ry' },
	{ label: 'Labradorinnoutajakerho ry' },
	{ label: 'Lahden Käyttökoira ry' },
	{ label: 'Lakeuden Agilityurheilijat ry' },
	{ label: 'Lakeuden Tokoilijat ry' },
	{ label: 'Lapin Mäyräkoirakerho ry' },
	{ label: 'Lapin Nuuskut ry' },
	{ label: 'Lappalaiskoirat ry' },
	{ label: 'Lappeenrannan Palveluskoirayhdistys ry' },
	{ label: 'Lapuan Koiraharrastajat ry' },
	{ label: 'Lempäälän-Vesilahden Koirakerho (LeVeK) ry' },
	{ label: 'Leppävirran Palvelus- ja Seurakoiraharrastajat ry' },
	{ label: 'Lieksan Palveluskoirakerho ry' },
	{ label: 'Lohjan Kirsut ry' },
	{ label: 'Lohjan Palvelus- ja Pelastuskoirayhdistys ry' },
	{ label: 'Lohtajan Palveluskoiraharrastajat ry' },
	{ label: 'Loimaan Seudun Kennelkerho ry' },
	{ label: 'Lounais-Hämeen Kennelkerho ry' },
	{ label: 'Lounais-Hämeen Pelastuskoirat ry (LHpeko)' },
	{ label: 'Luoteis-Uudenmaan Käyttökoirat ry' },
	{ label: 'Länsi-Uudenmaan Pelastuskoirayhdistys ry' },
	{ label: 'Länsirajan Kennelkerho ry' },
	{ label: 'Länsirannikon Pelastuskoirat ry (LRPK)' },
	{ label: 'Meri-Lapin Soihtu (M-L-PEKO)' },
	{ label: 'Mikkelin Agilityharrastajat ry' },
	{ label: 'Mikkelin Palveluskoirayhdistys ry' },
	{ label: 'Mikkelin Seudun Pelastuskoirat ry (MSPEKO)' },
	{ label: 'MoKoMa ry' },
	{ label: 'Mondioring ITU ry' },
	{ label: 'Mondioring Kotka ry' },
	{ label: 'Mondioringyhdistys ry' },
	{ label: 'Myrskylän Pelastuskoirat ry (Mypeko)' },
	{ label: 'Mäntsälän Koirakerho ry' },
	{ label: 'Mäntän Seudun Palveluskoirat ry' },
	{ label: 'Nokian Palveluskoiraharrastajat ry' },
	{ label: 'Nollakoira ry' },
	{ label: 'Novascotiannoutajat ry' },
	{ label: 'Nu-Pun Koiraklubi ry' },
	{ label: 'Nurmeksen Seudun Kennelkerho ry' },
	{ label: 'NyCarleby Hundklubb rf' },
	{ label: 'Opaskoirayhdistys ry' },
	{ label: 'Orimattilan Kennelkerho ry' },
	{ label: 'Oriveden Seudun Koirakerho ry' },
	{ label: 'Oulujokilaakson Kennelkerho ry' },
	{ label: 'Oulujokilaakson Pelastuskoirat ry (Olpeko)' },
	{ label: 'Oulun Koirakerho ry' },
	{ label: 'Oulun Läänin Pelastuskoirayhdistys ry (OLPY)' },
	{ label: 'Oulun Palveluskoirayhdistys ry' },
	{ label: 'Oulun Seudun Etsintäkoirat ry (OSE)' },
	{ label: 'Oulun Seudun Kennel- ja Agilityseura KAS ry' },
	{ label: 'Ounasjokilaakson Kennelkerho ry' },
	{ label: 'Ounasjokilaakson pelastuskoirat ry' },
	{ label: 'Outokummun Kennelseura ry' },
	{ label: 'Paltamon Koiraharrastajat ry' },
	{ label: 'Palveluskoiraklubi EPK ry' },
	{ label: 'Palveluskoiraklubi K9ers ry' },
	{ label: 'Palveluskoirayhdistys Kotikenttä ry' },
	{ label: 'Parkanon Seudun Palveluskoirakerho ry' },
	{ label: 'Pieksämäen Palveluskoirayhdistys ry' },
	{ label: 'Pielisen Aktiivikoirat ry' },
	{ label: 'Pietarsaaren Seudun Kennelseura ry' },
	{ label: 'Piilonkiertäjät ry' },
	{ label: 'Pirkanmaan Käyttökoirayhdistys ry' },
	{ label: 'Pirkanmaan Palveluskoiraharrastajat ry' },
	{ label: 'Pirkanmaan Pelastuskoirat ry' },
	{ label: 'Pohjanmaan PK-klubi ry' },
	{ label: 'Pohjanmaan Rottweilerkerho ry' },
	{ label: 'Pohjois-Hämeen Käyttökoirat PHK ry' },
	{ label: 'Pohjois-Karjalan Käyttökoirat ry' },
	{ label: 'Pohjois-Karjalan Pelastuskoirat ry' },
	{ label: 'Pohjois-Karjalan Seurakoirat ry' },
	{ label: 'Pohjois-Lapin Koirakerho ry' },
	{ label: 'Pohjois-Lapin Pelastuskoirat ry (PoLaPe)' },
	{ label: 'Pohjois-Pohjanmaan Urheilu- ja Työkoirat ry' },
	{ label: 'Pohjois-Savon Rottweilerkerho ry' },
	{ label: 'Pohjois-Suomen pelastuskoirat ry (POSPE)' },
	{ label: 'Pondera Team ry' },
	{ label: 'Pop Dog ry' },
	{ label: 'Porin Palveluskoirakerho ry' },
	{ label: 'Porvoon Palveluskoirat ry' },
	{ label: 'Porvoonseudun Koiraharrastajat ry' },
	{ label: 'Pumit ry' },
	{ label: 'Punkaharjun Koirat ry' },
	{ label: 'Pure Dogs ry' },
	{ label: 'Päijät-Hämeen Pelastuskoirat ry (PHPK)' },
	{ label: 'Päijäthoffit ry' },
	{ label: 'Raahen Koirakerho ry' },
	{ label: 'Raaseporin Pelastuskoirat ry (RasPeKo)' },
	{ label: 'Rally-toko Easy ry' },
	{ label: 'Rannikon rakit ry' },
	{ label: 'Rauman Käyttö- ja Seurakoirat ry' },
	{ label: 'Riihimäen Koiraharrastajat ry' },
	{ label: 'Riihimäen Pelastuskoirat – RiiPeko ry' },
	{ label: 'Riihimäen Seudun Kennelkerho ry' },
	{ label: 'Rovaniemen Käyttökoirat ry' },
	{ label: 'Rovaniemen Palveluskoirakerho ry' },
	{ label: 'Rovaniemen Palveluskoirakerho ry – pelastuskoirajaosto (ROPEKO)' },
	{ label: 'Saarijärven Käyttökoirat ry' },
	{ label: 'Saimaan Pelastuskoirat ry (Sapeko)' },
	{ label: 'Saksanpaimenkoiraliitto ry' },
	{ label: 'Salon Seudun Palveluskoiraharrastajat ry' },
	{ label: 'Salpausselän Pelastuskoirat ry (SalPeko)' },
	{ label: 'Sarplaninac Club Finland ry' },
	{ label: 'Satakunnan Koiraharrastajat ry' },
	{ label: 'Satakunnan Pelastuskoirat ry' },
	{ label: 'Savon Vetokoiraurheilijat ry' },
	{ label: 'Savonlinnan Kennelkerho ry' },
	{ label: 'Savonlinnan Palveluskoirayhdistys ry' },
	{ label: 'Seinäjoen Kennelkerho ry' },
	{ label: 'Sievin Kennelkerho ry' },
	{ label: 'Siilinjärven-Maaningan Pelastuskoirat ry' },
	{ label: 'Sipoon Palveluskoirat ry' },
	{ label: 'Sodankylän Karvakuonot ry' },
	{ label: 'Someron Seudun Koiraharrastajat ry' },
	{ label: 'SPL Ala-Satakunta ry' },
	{ label: 'SPL Etelä-Oulu ry' },
	{ label: 'SPL Etelä-Pohjanmaa ry' },
	{ label: 'SPL Etelä-Uusimaa ry' },
	{ label: 'SPL Forssa ry' },
	{ label: 'SPL Helsinki ry' },
	{ label: 'SPL Imatra ry' },
	{ label: 'SPL Itä-Helsinki ry' },
	{ label: 'SPL Itä-Pirkanmaa ry' },
	{ label: 'SPL Itä-Uusimaa ry' },
	{ label: 'SPL Jokela ry' },
	{ label: 'SPL Jyväskylä ry' },
	{ label: 'SPL Kanta-Häme ry' },
	{ label: 'SPL Kemi ry' },
	{ label: 'SPL Keski-Karjala ry' },
	{ label: 'SPL Keski-Suomi ry' },
	{ label: 'SPL Kotka ry' },
	{ label: 'SPL Kouvola ry' },
	{ label: 'SPL Kuopio ry' },
	{ label: 'SPL Kurikka ry' },
	{ label: 'SPL Kuusjoki ry' },
	{ label: 'SPL Kärkölä ry' },
	{ label: 'SPL Lahti ry' },
	{ label: 'SPL Lapinlahti ry' },
	{ label: 'SPL Länsi-Häme ry' },
	{ label: 'SPL Länsi-Uusimaa ry' },
	{ label: 'SPL Merenkurkku ry' },
	{ label: 'SPL Nurmijärvi ry' },
	{ label: 'SPL Oulu ry' },
	{ label: 'SPL Pietarsaarenseutu ry' },
	{ label: 'SPL Pohjois-Karjala ry' },
	{ label: 'SPL Pori ry' },
	{ label: 'SPL Porvoo ry' },
	{ label: 'SPL Raahe ry' },
	{ label: 'SPL Rauma ry' },
	{ label: 'SPL Rovaniemi ry' },
	{ label: 'SPL Röykkä ry' },
	{ label: 'SPL Saimaa ry' },
	{ label: 'SPL Savo-Karjala ry' },
	{ label: 'SPL Seinäjoki ry' },
	{ label: 'SPL Tampere ry' },
	{ label: 'SPL Turku ry' },
	{ label: 'SPL Wasa ry' },
	{ label: 'Sport Dogs Amazeme ry' },
	{ label: 'Sport Riesen Klub ry' },
	{ label: 'Springerspanielit ry' },
	{ label: 'Suomen Airedalenterrieriyhdistys ry' },
	{ label: 'Suomen Amerikanstaffordshirenterrieriyhdistys ry' },
	{ label: 'Suomen Australiankarjakoirat ry' },
	{ label: 'Suomen Beauceron ry' },
	{ label: 'Suomen Belgianpaimenkoirayhdistys ry' },
	{ label: 'Suomen Bokseriyhdistys ry' },
	{ label: 'Suomen Bordercolliet ja australiankelpiet ry' },
	{ label: 'Suomen Bouvier ry' },
	{ label: 'Suomen Briard ry' },
	{ label: 'Suomen Collieyhdistys ry' },
	{ label: 'Suomen Dobermannyhdistys ry' },
	{ label: 'Suomen Hollanninpaimenkoirat ry' },
	{ label: 'Suomen Hovawart ry' },
	{ label: 'Suomen Lagottoklubi ry' },
	{ label: 'Suomen Landseeryhdistys ry' },
	{ label: 'Suomen Mudiyhdistys ry' },
	{ label: 'Suomen Mustaterrierit ry' },
	{ label: 'Suomen Noutajakoirajärjestö ry' },
	{ label: 'Suomen Partacolliet ry' },
	{ label: 'Suomen Picardienpaimenkoirat ry' },
	{ label: 'Suomen Poliisikoirayhdistys ry' },
	{ label: 'Suomen Pyreneläiset ry' },
	{ label: 'Suomen Rottweileryhdistys ry' },
	{ label: 'Suomen Seurakoirayhdistys ry' },
	{ label: 'Suomen Sileäkarvaiset noutajat ry' },
	{ label: 'Suomen Snautserikerho ry' },
	{ label: 'Suomen Suursnautserikerho ry' },
	{ label: 'Suomen Sveitsinpaimenkoirat ry' },
	{ label: 'Suomen Tsekinpaimenkoirat ry' },
	{ label: 'Suomen Valkoinenpaimenkoira ry' },
	{ label: 'Suomen VEO' },
	{ label: 'Suomenselän Palveluskoirat ry' },
	{ label: 'Suonenjoen Palvelus- ja Seurakoiraharrastajat ry' },
	{ label: 'Suupohjan Koirakerho ry' },
	{ label: 'Suupohjan Pelastuskoirat ry (SUPE)' },
	{ label: 'T-Team Sport Dogs ry' },
	{ label: 'T.O.P K-9 ry' },
	{ label: 'Tampereen Palveluskoiraharrastajat ry' },
	{ label: 'Tampereen Seudun Etsintäkoirat ry (TSE)' },
	{ label: 'Tampereen Seudun Koirakerho ry' },
	{ label: 'Tampereen Vetokoiraseura ry' },
	{ label: 'Tassutaito ry' },
	{ label: 'Team Fieldgood' },
	{ label: 'Team Working Dogs ry' },
	{ label: 'Teiskon Tahto Tassut ry' },
	{ label: 'TervaNuuskut' },
	{ label: 'Toijalan Seudun Koirakerho ry' },
	{ label: 'Tornion Kennelkerho ry' },
	{ label: 'Tunnistusetsintä- ja pelastuskoirat ry (TEtsi)' },
	{ label: 'Turun Kenttäkoirayhdistys ry' },
	{ label: 'Turun Käyttökoirakerho ry' },
	{ label: 'Turun Palveluskoiraharrastajat ry' },
	{ label: 'Turun Seudun Agilityurheilijat ry' },
	{ label: 'Tuuloksen Koirakerho' },
	{ label: 'Tuusulan Kennelkerho ry' },
	{ label: 'TVA Pori ry' },
	{ label: 'Tyrnävän koiraharrastajat ry' },
	{ label: 'Ulvilan Palveluskoirat ry' },
	{ label: 'Uudenmaan Harrastuskoirat ry' },
	{ label: 'Uudenmaan Pelastuskoirat ry (UPK)' },
	{ label: 'Uudenmaan pelastusliitto – Itä-Uusimaa ry – pelastuskoiraosasto (ITUPE)' },
	{ label: 'Uudenmaan Urheilukoirat ry' },
	{ label: 'Uudenmaan Vetokoiraurheilijat ry' },
	{ label: 'Vaasan Agilityseuran RT&T ry' },
	{ label: 'Vaasan Seudun Palveluskoiraharrastajat ry' },
	{ label: 'Vakka-Suomen Kennelkerho' },
	{ label: 'Vakka-Suomen Palveluskoiraharrastajat ry' },
	{ label: 'Valkeakosken Kennelkerho ry' },
	{ label: 'Vammalan Palveluskoiraharrastajat ry' },
	{ label: 'Vantaa SAR Dogs ry' },
	{ label: 'Vantaan Etsintäkoirat' },
	{ label: 'Vantaan Palveluskoirayhdistys ry' },
	{ label: 'Vapaaehtoiset Pirkanmaa: Etsintä- ja koiratoiminta (VAPEKO)' },
	{ label: 'Varkauden Palvelus- ja Seurakoirat ry' },
	{ label: 'Varsinais-Suomen Pelastuskoirat ry (VSPK)' },
	{ label: 'Varsinaiset Hoffit' },
	{ label: 'VaVi ry' },
	{ label: 'Veikkolan Koirakerho ry' },
	{ label: 'Vesikoirat ry' },
	{ label: 'Villähteen Agilityurheilijat ry' },
	{ label: 'Virtain-Ruoveden Kirsut ry' },
	{ label: 'VRG Pelastuskoirat ry' },
	{ label: 'Vuosaaren Koirakerho ry' },
	{ label: 'Västnyländska hundföreningen rf - Länsi-Uudenmaan Koirayhdistys ry' },
	{ label: 'Western Finland Ring Club ry' },
	{ label: 'Working Dobermann Club ry' },
	{ label: 'Ylläksen koirakerho ry – pelastuskoirat (YLPE)' },
	{ label: 'Ylöjärven Koirakerho ry' },
	{ label: 'Ylöjärven Käyttöhukat ry' },
	{ label: 'Ålands Bruks- och Sällskapshundklubb' },
	{ label: 'Ålands Räddningshundsklubb rf (ÅRHK)' }
]

// const flatProps = {
// 	options: jasenjarjestot.map((option) => option.label),
// };

/*const data = [
	["Task", "Hours per Day"],
	["Work", 11],
	["Eat", 2],
	["Commute", 2],
	["Watch TV", 2],
	["Sleep", 7],
];*/

/*const options = {
	title: "Merkintöjen jakauma",
	pieSliceText: "value"
};*/

interface TilastoProps {
	theme: Theme;
}

const Tilasto = observer(class Tilasto extends Component<TilastoProps> {

	yhteensa: number | null = null;
	editYhdistys = false;
	yhdistysSaveError = false;
	savingYhdistys = false;
	yksikko = "X";
	tilastoVuosi = (new Date()).getFullYear();
	tilastotColl: Collection<Document<any>> | null = null;
	tilastoDokumentti: Document<any> | null = null;
	// Document.hasData reflects Firestore existence (false forever for a brand-new
	// user who's never set a club), so it can't gate rendering. This tracks whether
	// tilastoDokumentti's *first snapshot* has arrived — existence-agnostic — via
	// Document.ready(). Without it, "Oma yhdistys" can render from the still-empty
	// placeholder data before the real snapshot lands, showing 'PUUTTUU!' even
	// though the field is correctly set in Firestore.
	ownTilastoReady = false;
	uid!: string;
	disposeAuthReaction?: () => void;

	static contextType = FirebaseContext;
	declare context: any;

	constructor(props: any) {
		super(props);

		makeObservable(this, {
			editYhdistys: observable,
			yhdistysSaveError: observable,
			savingYhdistys: observable,
			yksikko: observable,
			tilastoVuosi: observable,
			tilastotColl: observable.ref,
			tilastoDokumentti: observable.ref,
			ownTilastoReady: observable,
			vaihdaVuosi: action,
			vaihdaYksikko: action,
			closeYhdistysEdit: action,
			openYhdistysEdit: action,
			initFirestore: action,
			setYhdistysSaveState: action
		})
	}

	componentDidMount() {
		// this.context is a mobx-react tracked getter and can't be read inside a plain
		// reaction() — copy the (stable) rootStore reference out here first, per
		// https://github.com/mobxjs/mobx/blob/main/packages/mobx-react/README.md#note-on-using-props-and-state-in-derivations
		const sessionStore = this.context.rootStore.sessionStore;

		// Firestore rules require an authenticated request to read `tilastot`. The auth
		// token needs a moment to propagate to the Firestore client after sign-in
		// (see Firebase.ts) — subscribing before that gets a permission-denied that
		// firestorter's listener never retries. Wait for authTokenReady instead of
		// subscribing immediately in componentWillMount/constructor.
		this.disposeAuthReaction = reaction(
			() => sessionStore.authTokenReady ? sessionStore.authUser : null,
			(authUser) => {
				if (authUser) {
					this.initFirestore(authUser.uid);
				}
			},
			{ fireImmediately: true }
		);
	}

	componentWillUnmount() {
		this.disposeAuthReaction?.();
	}

	initFirestore = (uid: string) => {
		this.uid = uid;
		this.tilastotColl = new Collection('tilastot');
		this.tilastoDokumentti = new Document('tilastot/' + uid);
		this.ownTilastoReady = false;
		this.tilastoDokumentti.ready().then(() => {
			runInAction(() => {
				this.ownTilastoReady = true;
			});
		});
	}

	vaihdaYksikko = (event: any) => {
		this.yksikko = event.target.value
	}

	vaihdaVuosi = (event: any) => {
		this.tilastoVuosi = event.target.value
	}

	openYhdistysEdit = (_event?: any) => {
		this.editYhdistys = true
		this.yhdistysSaveError = false
	}

	closeYhdistysEdit = (_event?: any) => {
		this.editYhdistys = false
		this.yhdistysSaveError = false
	}

	setYhdistysSaveState = (saving: boolean, error: boolean) => {
		this.savingYhdistys = saving
		this.yhdistysSaveError = error
	}

	// Firestore write, not merge — must confirm success before closing the dialog.
	// A write that silently fails (rules rejection, network hiccup) previously left
	// the dialog closing anyway, so the user believed their selection was saved when
	// it never reached Firestore at all.
	saveYhdistys = async (value: string) => {
		if (!this.tilastoDokumentti) {
			return
		}
		this.setYhdistysSaveState(true, false)
		try {
			await this.tilastoDokumentti.set({ yhd: value }, { merge: true })
			this.setYhdistysSaveState(false, false)
			this.closeYhdistysEdit()
		}
		catch (error) {
			console.error('Oman yhdistyksen tallennus epäonnistui', error)
			this.setYhdistysSaveState(false, true)
		}
	}

	render() {
		const context = this.context
		if (!context.rootStore.sessionStore.userOk) {
			console.log('Tilastot.render, disabled. Bad path/user');
			return (
				<div>
				</div>
			);
		} else if (!this.tilastoDokumentti || !this.tilastotColl || !this.ownTilastoReady) {
			// Waiting for the auth token to propagate before subscribing to Firestore
			// (see initFirestore()), and then for tilastoDokumentti's first snapshot to
			// actually arrive — reading "yhd" from its still-empty placeholder data
			// would show 'PUUTTUU!' even when it's correctly set in Firestore.
			return (
				<div><CircularProgress /></div>
			);
		} else {
			const yksikko = this.yksikko
			const tilastoVuosi = this.tilastoVuosi
			const isMobileView = typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;
			const isDarkMode = this.props.theme.palette.mode === 'dark';
			const chartBackground = isDarkMode ? '#1f1f1f' : '#ffffff';
			const chartAreaBackground = isDarkMode ? '#242424' : '#ffffff';
			const chartTextColor = isDarkMode ? '#e6e6e6' : '#1f1f1f';
			const chartThemeKey = isDarkMode ? 'dark' : 'light';

			const getPieChartOptions = (title: string) => ({
				title,
				pieSliceText: 'value',
				backgroundColor: chartBackground,
				titleTextStyle: { color: chartTextColor },
				pieSliceTextStyle: { color: chartTextColor },
				legend: isMobileView
					? {
						position: 'bottom',
						alignment: 'center',
						maxLines: 5,
						textStyle: { fontSize: 12, color: chartTextColor }
					}
					: {
						position: 'right',
						alignment: 'center',
						textStyle: { fontSize: 13, color: chartTextColor }
					},
				chartArea: isMobileView
					? {
						left: 8,
						right: 8,
						top: 48,
						bottom: 80,
						width: '100%',
						height: '70%',
						backgroundColor: chartAreaBackground
					}
					: {
						left: 16,
						right: 16,
						top: 56,
						bottom: 24,
						width: '100%',
						height: '74%',
						backgroundColor: chartAreaBackground
					}
			});

			/**
			 * Builds pie chart rows from local hashtag statistics and merges overflow into "Muut".
			 */
			const createHashtagChartData = () => {
				const hashtagStats = buildHashtagStats(
					context.rootStore.reeniFirestore.reenit.docs as ReeniForHashtagStats[],
					tilastoVuosi
				);
				const unitKey = yksikko as 'H' | 'X';
				const topLimit = 8;

				const sortedRows = Object.entries(hashtagStats)
					.map(([tag, values]) => ({ tag, value: values[unitKey] }))
					.filter((row) => row.value > 0)
					.sort((a, b) => b.value - a.value || a.tag.localeCompare(b.tag, 'fi'));

				if (sortedRows.length === 0) {
					return null;
				}

				const topRows = sortedRows.slice(0, topLimit);
				const othersValue = sortedRows.slice(topLimit).reduce((sum, row) => sum + row.value, 0);

				const chartRows: (string | number)[][] = topRows.map((row) => [
					`#${row.tag}`,
					Math.round(row.value * 100) / 100,
				]);

				if (othersValue > 0) {
					chartRows.push(['Muut', Math.round(othersValue * 100) / 100]);
				}

				return [['Hashtag', 'Arvo'], ...chartRows];
			};

			const hashtagChartData = createHashtagChartData();

			const kuluvaVuosi = (new Date()).getFullYear()
			const range = (start, stop, step = 1) =>
				Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
			const vuodet = range(2021, kuluvaVuosi + 1, 1)

			const { docs: tilastoDocs, isLoading: isTilastoLoading } = this.tilastotColl;
			const tilastoVuodenKaikkiTilastot = tilastoDocs
				.filter((tilasto) => tilasto.data[tilastoVuosi]).map((tilasto) => tilasto.data[tilastoVuosi])
				.filter((tilasto) => tilasto.sumH > 0)
			const tilastoVuodenAkmTilastot = tilastoDocs
				.filter((tilasto) => tilasto.data[tilastoVuosi])
				.map((tilasto) => tilasto.data[tilastoVuosi])
				.filter((tilasto) => isValidAkm(tilasto.akm))
			const tilastovuoden_tunnit_yhteensa = tilastoVuodenKaikkiTilastot.map((tilasto) => tilasto.sumH || 0).reduce((a, b) => a + b, 0)
			const tilastovuoden_paivat_yhteensa = tilastoVuodenKaikkiTilastot.map((tilasto) => tilasto.sumD || 0).reduce((a, b) => a + b, 0)
			const kaikki_sumX = tilastoVuodenKaikkiTilastot.map((tilasto) => tilasto.sumX || 0).reduce((a, b) => a + b, 0)
			const tilastovuoden_paivaa_viikossa = tilastoVuodenKaikkiTilastot.length > 0
				? tilastovuoden_paivat_yhteensa
					/ tilastoVuodenKaikkiTilastot.length
					/ (tilastoVuosi == kuluvaVuosi ? (moment().dayOfYear()) : 365)
					* 7
				: 0
			const tilastovuoden_akm_yhteensa = tilastoVuodenAkmTilastot.map((tilasto) => tilasto.akm || 0).reduce((a, b) => a + b, 0)
			const tilastovuoden_akm_kayttajat = tilastoVuodenAkmTilastot.length
			const tilastovuoden_keskiakm = tilastovuoden_akm_kayttajat > 0
				? tilastovuoden_akm_yhteensa / tilastovuoden_akm_kayttajat
				: 0

			// Painotettu keskiarvo yli kaikkien käyttäjien merkintöjen (ei käyttäjäkohtaisten keskiarvojen keskiarvo).
			// Rajataan käyttäjiin, joilla on sekä akm että akmX tiedossa — akmX/keskiakm
			// lisättiin vasta myöhemmin (45a0081), joten osalla vanhemmista
			// vuosikohtaisista tilastoista on akm mutta ei akmX:ää. Jos ne otettaisiin
			// mukaan, kilometrimäärä jaettaisiin liian pienellä merkintämäärällä.
			const tilastoVuodenAkmPerMerkintaTilastot = tilastoVuodenAkmTilastot
				.filter((tilasto) => typeof tilasto.akmX === 'number' && tilasto.akmX > 0)
			const tilastovuoden_akm_merkinta_km_yhteensa = tilastoVuodenAkmPerMerkintaTilastot.map((tilasto) => tilasto.akm || 0).reduce((a, b) => a + b, 0)
			const tilastovuoden_akm_merkintoja_yhteensa = tilastoVuodenAkmPerMerkintaTilastot.map((tilasto) => tilasto.akmX || 0).reduce((a, b) => a + b, 0)
			const tilastovuoden_akm_per_merkinta = tilastovuoden_akm_merkintoja_yhteensa > 0
				? tilastovuoden_akm_merkinta_km_yhteensa / tilastovuoden_akm_merkintoja_yhteensa
				: 0

			const oma_tilasto = tilastoDocs.find((tilasto) => tilasto.id === this.uid)?.data[tilastoVuosi]
			const oma_sumH = oma_tilasto?.sumH || 0
			const oma_sumX = oma_tilasto?.sumX || 0
			const oma_sumD = oma_tilasto?.sumD || 0
			const oma_paivaa_viikossa = oma_sumD > 0
				? oma_sumD / (tilastoVuosi == kuluvaVuosi ? moment().dayOfYear() : 365) * 7
				: 0
			const oma_akm_yhteensa = oma_tilasto && isValidAkm(oma_tilasto.akm) ? oma_tilasto.akm : 0
			const oma_akm_per_merkinta = oma_tilasto && isValidAkm(oma_tilasto.akm)
				? oma_tilasto.keskiakm
				: 0


			const yhdistyksenTilastoDocs = tilastoDocs.filter((row) => (row.data.yhd || '') === this.tilastoDokumentti.data.yhd)
			const yhdistys_yhteensa = yhdistyksenTilastoDocs.map((tilasto) => tilasto.data[tilastoVuosi] ? tilasto.data[tilastoVuosi].sumH : 0).reduce((a, b) => a + b, 0)
			const kuluvanVuodenTilastot = yhdistyksenTilastoDocs.filter((tilasto) => tilasto.data[tilastoVuosi]).map((tilasto) => tilasto.data[tilastoVuosi]).filter((tilasto) => tilasto.sumH > 0)
			const yhdistys_sumX = kuluvanVuodenTilastot.map((tilasto) => tilasto.sumX || 0).reduce((a, b) => a + b, 0)
			const yhdistyksenAkmTilastot = kuluvanVuodenTilastot.filter((tilasto) => isValidAkm(tilasto.akm))
			const yhdistys_akm_yhteensa = yhdistyksenAkmTilastot.map((tilasto) => tilasto.akm || 0).reduce((a, b) => a + b, 0)
			const yhdistys_akm_kayttajat = yhdistyksenAkmTilastot.length
			const yhdistys_keskiakm = yhdistys_akm_kayttajat > 0
				? yhdistys_akm_yhteensa / yhdistys_akm_kayttajat
				: 0
			// Ks. kommentti tilastovuoden_akm_per_merkinta:n yhteydessä — sama akmX-
			// puuttumisongelma koskee myös yhdistyksen jäseniä.
			const yhdistyksenAkmPerMerkintaTilastot = yhdistyksenAkmTilastot
				.filter((tilasto) => typeof tilasto.akmX === 'number' && tilasto.akmX > 0)
			const yhdistys_akm_merkinta_km_yhteensa = yhdistyksenAkmPerMerkintaTilastot.map((tilasto) => tilasto.akm || 0).reduce((a, b) => a + b, 0)
			const yhdistys_akm_merkintoja_yhteensa = yhdistyksenAkmPerMerkintaTilastot.map((tilasto) => tilasto.akmX || 0).reduce((a, b) => a + b, 0)
			const yhdistys_akm_per_merkinta = yhdistys_akm_merkintoja_yhteensa > 0
				? yhdistys_akm_merkinta_km_yhteensa / yhdistys_akm_merkintoja_yhteensa
				: 0

			const yhdistykset = new Set()
			tilastoDocs.filter((tilasto) => tilasto.data[tilastoVuosi] !== undefined).map((tilasto) => yhdistykset.add(tilasto.data.yhd))

			if (kuluvanVuodenTilastot.length > 1) {
				const byCat = new Object()
				REENI_CATEGORIES.forEach((cat) => byCat[cat] = kuluvanVuodenTilastot
					.map((tilasto) => (tilasto[cat]?.[yksikko] || 0))
					.reduce((p, c) => p + c, 0)
				)

				var chartDataYhd: (string | number)[][] = [['Kategoria', 'Kerrat']]
				chartDataYhd = chartDataYhd.concat(Object.entries(byCat).map(([key, value]) => ([key, Math.round(value)])))

			}
			else {
				var chartDataYhd: (string | number)[][] = [['Kategoria', 'Kerrat']]
			}


			if (tilastoDocs.length > 1) {
				const byCat = new Object()
				REENI_CATEGORIES.forEach((cat) => byCat[cat] = tilastoDocs
					.filter((tilasto) => tilasto.data[tilastoVuosi])
					.map((tilasto) => tilasto.data[tilastoVuosi])
					.map((tilasto) => (tilasto[cat]?.[yksikko] || 0))
					.reduce((p, c) => p + c, 0)
				)

				var chartDataAll: (string | number)[][] = [['Kategoria', 'Kerrat']]
				chartDataAll = chartDataAll.concat(Object.entries(byCat).map(([key, value]) => ([key, Math.round(value)])))

			}

			if (tilastoDocs.length > 1) {
				const byCat = new Object()
				REENI_CATEGORIES.forEach((cat) => byCat[cat] = tilastoDocs
					.filter((tilasto) => tilasto.id == this.uid)
					.filter((tilasto) => tilasto.data[tilastoVuosi])
					.map((tilasto) => tilasto.data[tilastoVuosi])
					.map((tilasto) => (tilasto[cat]?.[yksikko] || 0))
					.reduce((p, c) => p + c, 0)
				)

				var chartDataMy: (string | number)[][] = [['Kategoria', 'Kerrat']]
				chartDataMy = chartDataMy.concat(Object.entries(byCat).map(([key, value]) => ([key, value])))

			}
			var reenejaViikossa = 0
			if (kuluvanVuodenTilastot.length > 1) {
				reenejaViikossa = kuluvanVuodenTilastot
					.filter((tilasto) => (tilasto.sumD > 0))
					.map((tilasto) => (tilasto.sumD))
					.reduce((p, c) => p + c, 0) / kuluvanVuodenTilastot.length / (tilastoVuosi == kuluvaVuosi ? (moment().dayOfYear() / 7) : 365 / 7)
			}
			const yhdistys = this.tilastoDokumentti.data.yhd || 'PUUTTUU!'

			const statRows: { label: string; oma: string; yhdistys: string; kaikki: string }[] = [
				{
					label: 'Käyttäjiä',
					oma: '1',
					yhdistys: String(kuluvanVuodenTilastot.length),
					kaikki: String(tilastoVuodenKaikkiTilastot.length)
				},
				{
					label: 'Merkintöjä yhteensä',
					oma: String(oma_sumX),
					yhdistys: String(yhdistys_sumX),
					kaikki: String(kaikki_sumX)
				},
				{
					label: 'Tunteja yhteensä (h)',
					oma: oma_sumH.toFixed(1),
					yhdistys: yhdistys_yhteensa.toFixed(1),
					kaikki: tilastovuoden_tunnit_yhteensa.toFixed(1)
				},
				{
					label: 'Reenipäiviä / vko',
					oma: oma_paivaa_viikossa.toFixed(2),
					yhdistys: reenejaViikossa.toFixed(2),
					kaikki: tilastovuoden_paivaa_viikossa.toFixed(2)
				}
			]

			if (tilastovuoden_akm_kayttajat > 0) {
				statRows.push(
					{
						label: 'Ajokilometrit yhteensä (km)',
						oma: oma_akm_yhteensa.toFixed(0),
						yhdistys: yhdistys_akm_yhteensa.toFixed(0),
						kaikki: tilastovuoden_akm_yhteensa.toFixed(0)
					},
					{
						label: 'Ajokilometrit / käyttäjä (km)',
						oma: oma_akm_yhteensa.toFixed(0),
						yhdistys: yhdistys_akm_kayttajat > 0 ? yhdistys_keskiakm.toFixed(0) : '–',
						kaikki: tilastovuoden_keskiakm.toFixed(0)
					},
					{
						label: 'Ajokilometrit / merkintä (km)',
						oma: oma_akm_per_merkinta > 0 ? oma_akm_per_merkinta.toFixed(1) : '–',
						yhdistys: yhdistys_akm_per_merkinta > 0 ? (yhdistys_akm_per_merkinta).toFixed(1) : '–',
						kaikki: (tilastovuoden_akm_per_merkinta).toFixed(1)
					}
				)
			}

			return (
				<div>
					<div>
						{(isTilastoLoading || false) ? <div ><CircularProgress /></div> : undefined}
					</div>
					<Typography variant="body1" gutterBottom >Oma yhdistys: {yhdistys}
						<IconButton
							onClick={this.openYhdistysEdit} >
							<EditIcon />
						</IconButton>
					</Typography>
					<Dialog onClose={this.closeYhdistysEdit} open={this.editYhdistys}>
						<Paper sx={{ m: 2, p: 2 }}>
							<Autocomplete
								options={jasenjarjestot.map((option) => option.label)}
								sx={{ width: 400 }}
								id={"edityhdistys"}
								value={this.tilastoDokumentti.data.yhd || ''}
								disabled={this.savingYhdistys}
								onChange={(e, value) => {
									if (value !== null) {
										this.saveYhdistys(value);
									}
								}}
								renderInput={(params) => (
									<TextField {...params} label={"Oma yhdistys"} variant={"filled"} />
								)}
							/>
							{this.yhdistysSaveError && (
								<Typography variant="body2" color="error" sx={{ mt: 1 }}>
									Tallennus epäonnistui. Tarkista verkkoyhteys ja yritä uudelleen.
								</Typography>
							)}

						</Paper>
					</Dialog>

					<FormControl >
						<InputLabel id="vuosi-select-label">Vuosi</InputLabel>
						<Select
							labelId="vuosi-select-label"
							id="vuosi-select"
							value={tilastoVuosi}
							label="Vuosi"
							onChange={this.vaihdaVuosi}
						>
							{
								vuodet.map((vuosi) => <MenuItem value={vuosi} key={vuosi}>{vuosi}</MenuItem>)
							}
						</Select>
					</FormControl>



					
					<FormControl>
						<FormLabel id="yksikko-buttons">Kuvaajien yksikkö</FormLabel>
						<RadioGroup
							row
							aria-labelledby="yksikko-buttons"
							name="controlled-radio-buttons-group"
							value={yksikko}
							onChange={this.vaihdaYksikko}
						>
							<FormControlLabel value="X" control={<Radio />} label="Merkintöjä" />
							<FormControlLabel value="H" control={<Radio />} label="Tunteja" />

						</RadioGroup>

					</FormControl>
					<Chart
						key={`my-${chartThemeKey}`}
						chartType="PieChart"
						data={chartDataMy}
						options={getPieChartOptions("Omien merkintöjen " + (yksikko == 'X' ? "" : "tunti") + "jakauma")}
						width={"100%"}
						height={"300px"}
					/>
					<Chart
						key={`yhd-${chartThemeKey}`}
						chartType="PieChart"
						data={chartDataYhd}
						options={getPieChartOptions("Merkintöjen " + (yksikko == 'X' ? "" : "tunti") + "jakauma yhdistyksessä")}
						width={"100%"}
						height={"300px"}
					/>
					<Chart
						key={`all-${chartThemeKey}`}
						chartType="PieChart"
						data={chartDataAll}
						options={getPieChartOptions("Merkintöjen " + (yksikko == 'X' ? "" : "tunti") + "jakauma, kaikki käyttäjät")}
						width={"100%"}
						height={"300px"}
					/>

					{hashtagChartData ? (
						<Chart
							key={`hashtag-${chartThemeKey}`}
							chartType="PieChart"
							data={hashtagChartData}
							options={getPieChartOptions("Hashtagien " + (yksikko == 'X' ? "merkintä" : "tunti") + "jakauma omissa reeneissä")}
							style={{ width: '100%', maxWidth: '100%' }}
							width={"100%"}
							height={"300px"}
						/>
					) : (
						<Typography variant="body1" gutterBottom>
							Ei hashtag-merkintöjä vuodelle {tilastoVuosi}
						</Typography>
					)}

					<TableContainer component={Paper} sx={{ my: 2 }}>
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell>Tilastovuosi {tilastoVuosi}</TableCell>
									<TableCell align="right">Oma</TableCell>
									<TableCell align="right">{yhdistys}</TableCell>
									<TableCell align="right">Kaikki</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{statRows.map((row) => (
									<TableRow key={row.label}>
										<TableCell component="th" scope="row">{row.label}</TableCell>
										<TableCell align="right">{row.oma}</TableCell>
										<TableCell align="right">{row.yhdistys}</TableCell>
										<TableCell align="right">{row.kaikki}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>



					<Typography variant="caption" color="text.secondary" gutterBottom>
						{yhdistykset.size} yhdistystä tilastoinnissa
					</Typography>
				</div>
			)
		}
	}


});

const TilastoWithTheme = () => {
	const theme = useTheme();
	return <Tilasto theme={theme} />;
};

export default TilastoWithTheme;
