import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { TextField } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import Dialog from '@mui/material/Dialog';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

import fiLocale from 'date-fns/locale/fi';


import moment from 'moment';
import 'moment/locale/fi';
moment.locale('fi')



const styles = {
	container: {
		display: 'inline',
		flexDirection: 'row',
		height: '90%'

	},
	row: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center'
	},
	checkbox: {
		marginLeft: 16,
		width: 40
	},
	input: {
		flex: 1
	},
	icon: {
		marginRight: 6
	}
} as const;

interface ReeniItemProps {
	item: any;
	closeF: () => void;
}

class ReeniItem extends Component<ReeniItemProps> {
	_deleting = false;

	render() {
		const { item } = this.props;
		// const { pvm, kategoria, tunnit, alakategoria, kommentti, koira } = item.data;
		const { pvm, kategoria, tunnit, kommentti, koira } = item.data;

		return (
			<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fiLocale}>

				<Dialog onClose={() => {
					// console.debug("Closing");
					this.props.closeF()
				}} open={true}>

					<Box sx={{ flexGrow: 1 }}>
						<Grid
							container
							justifyContent="space-between"
							spacing={3}
							p={2}
							minHeight='200px'
							columns={12}>
							<Grid size={{ xs: 6, md: 3 }}>
								<InputLabel id="date-label">Päivämäärä</InputLabel>

								<MobileDatePicker
									format="dd.MM.yyyy"
									value={pvm ? new Date(pvm) : null}
									minDate={new Date("12/01/2021")}
									maxDate={new Date("12/31/2031")}
									onChange={(e) => {
										this.onPvmChange(moment(e).format('YYYY-MM-DD'))
									}}
									slotProps={{ textField: { id: this.props.item.id + "foo" } }}
								/>
							</Grid>

							<Grid size={{ xs: 6, md: 3 }}>
								<InputLabel id="demo-simple-select-label">Kesto</InputLabel>
								<Select
									labelId="demo-simple-select-label"
									id={this.props.item.id + "demo-simple-select"}
									value={tunnit}
									label="Kesto"
									fullWidth
									onChange={this.onKestoChange}
								>
									<MenuItem value={0}> </MenuItem>
									<MenuItem value={0.25}>lyhyt</MenuItem>
									<MenuItem value={0.5}>0,5 h</MenuItem>
									<MenuItem value={1}>1 h</MenuItem>
									<MenuItem value={1.5}>1,5 h</MenuItem>
									<MenuItem value={2}>2 h</MenuItem>
									<MenuItem value={2.5}>2,5 h</MenuItem>
									<MenuItem value={3}>3 h</MenuItem>
									<MenuItem value={4}>4 h</MenuItem>
									<MenuItem value={5}>5 h</MenuItem>
									<MenuItem value={6}>6 h</MenuItem>
									<MenuItem value={7}>7 h</MenuItem>
									<MenuItem value={8}>8 h</MenuItem>
									<MenuItem value={9}>9 h</MenuItem>
									<MenuItem value={10}>10 h</MenuItem>

								</Select>
							</Grid>

							<Grid size={{ xs: 6, md: 3 }}>
								<InputLabel id="kategoria-label">Kategoria</InputLabel>
								<Select
									labelId="kategoria-label"
									id={this.props.item.id + "kategoria-select"}
									value={kategoria || "Ei kategoriaa"}
									label="Kategoria"
									fullWidth
									onChange={this.onKategoriaChange}
								>
									<MenuItem value={'Ei kategoriaa'}>	Ei kategoriaa</MenuItem>
									<MenuItem value={'Jälki'}>			Jälki</MenuItem>
									<MenuItem value={'Partsa'}>			Partsa</MenuItem>
									<MenuItem value={'Ilmavainu'}>		Ilmavainu</MenuItem>
									<MenuItem value={'Tottis'}>			Tottis</MenuItem>
									<MenuItem value={'Raunio'}>			Raunio</MenuItem>
									<MenuItem value={'Rakennus'}>		Rakennus</MenuItem>
									<MenuItem value={'Laviini'}>		LaViini</MenuItem>
									<MenuItem value={'Muu reeni'}>		Muu reeni</MenuItem>
									<MenuItem value={'Muu y-toiminta'}>	Muu y-toiminta</MenuItem>

								</Select>
							</Grid>

							<Grid size={{ xs: 6, md: 3 }}>
								<InputLabel id="koira-label">Koira</InputLabel>
								<Select
									labelId="koira-label"
									id={this.props.item.id + "koira-select"}
									value={koira || "Ei koiraa"}
									label="Koira"
									fullWidth
									onChange={this.onKoiraChange}
								>
									<MenuItem value={'Ei koiraa'}>Ei koiraa</MenuItem>
									<MenuItem value={'Ykköskoira'}>Ykköskoira</MenuItem>
									<MenuItem value={'Kakkoskoira'}>Kakkoskoira</MenuItem>
									<MenuItem value={'Kolmoskoira'}>Kolmoskoira</MenuItem>
									<MenuItem value={'Joku muu'}>Joku muu</MenuItem>

								</Select>
							</Grid>

							<Grid size={12}>
								<TextField
									id={item.id + "textfield"}
									style={styles.input}
									multiline
									fullWidth
									label={"Muistiinpanot"}
									rows={5}
									variant={"filled"}
									onBlur={this.onTextChange}
									defaultValue={kommentti || ''} />
							</Grid>

							<Grid ml={1} size={1}>
								<IconButton
									style={styles.icon}
									onClick={this.onPressDelete} >
									<DeleteIcon />
								</IconButton>
							</Grid>

							<Grid mr={3} size={1}>
								<IconButton

									style={styles.icon}
									onClick={() => {
										// console.debug("Closing");
										this.props.closeF()
									}} >
									<CheckIcon />
								</IconButton>
							</Grid>
						</Grid>
					</Box>
				</Dialog>
			</LocalizationProvider >
		);
	}

	onPressDelete = async () => {
		const { item } = this.props;
		if (this._deleting) return;
		this._deleting = true;
		try {
			await item.delete();
			this._deleting = false;
		}
		catch (err) {
			this._deleting = false;
		}
	};

	onPressCheck = async () => {
		const { item } = this.props;
		await item.update({
			finished: !item.data.finished
		});
	};

	onTextChange = async (event) => {
		const { item } = this.props;
		await item.update({
			kommentti: event.target.value
		});
	};

	onPvmChange = async (event: string) => {
		const { item } = this.props;
		await item.update({
			pvm: event
		});
	};

	onKestoChange = async (event) => {
		const { item } = this.props;
		await item.update({
			tunnit: event.target.value
		});
	};

	onKoiraChange = async (event) => {
		const { item } = this.props;
		await item.update({
			koira: event.target.value
		});
	};

	onYhdistysChange = async (event) => {
		const { item } = this.props;
		await item.update({
			yhdistys: event.target.value
		});
	};

	onKategoriaChange = async (event) => {
		const { item } = this.props;
		await item.update({
			kategoria: event.target.value
		});
	};
}

export default observer(ReeniItem);
