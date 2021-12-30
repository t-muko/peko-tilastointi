import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { TextField } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';

import DateAdapter from '@mui/lab/AdapterMoment';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MobileDatePicker from '@mui/lab/MobileDatePicker';
import moment from 'moment';



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
};

class ReeniItem extends Component {
	static propTypes = {
		reeni: PropTypes.any
	};

	render() {
		const { item } = this.props;
		const { pvm, kategoria, tunnit, alakategoria, kommentti, koira } = item.data;

		// console.log('TodoItem.render: ', item.path, ', kommentti: ', kommentti);
		return (
			<LocalizationProvider dateAdapter={AdapterDateFns}>

				<Dialog onClose={() => {
					// console.debug("Closing");
					this.props.closeF()
				}} open={true}>

					<Box sx={{ flexGrow: 1 }}>
						<Grid container spacing={3} p={2} minHeight='200px'>
							<Grid item xs={6}>
							<InputLabel id="date-label">Päivämäärä</InputLabel>

								<MobileDatePicker
									labelId="date-label"
									inputFormat="MM/dd/yyyy"
									value={pvm}
									minDate={new Date("12/01/2021")}
									maxDate={new Date("12/31/2031")}									
									onChange={(e) => {
										// console.log("Date", moment(e).format('YYYY-MM-DD'));
										this.onPvmChange(moment(e).format('YYYY-MM-DD'))
									}}
									renderInput={(params) => <TextField id={this.id + "foo"} {...params} />}
								/>
							</Grid>

							<Grid item xs={6}>
									<InputLabel id="demo-simple-select-label">Kesto</InputLabel>
									<Select
										labelId="demo-simple-select-label"
										id={this.id +"demo-simple-select"}
										value={tunnit }
										label="Kesto"
										onChange={this.onKestoChange}
									>
										<MenuItem value={0}> </MenuItem>
										<MenuItem value={0.5}>0,5h</MenuItem>
										<MenuItem value={1}>1h</MenuItem>
										<MenuItem value={1.5}>1,5h</MenuItem>
										<MenuItem value={2}>2h</MenuItem>
										<MenuItem value={3}>3h</MenuItem>
										<MenuItem value={4}>4h</MenuItem>
										<MenuItem value={5}>5h</MenuItem>

									</Select>
							</Grid>

							<Grid item xs={6}>
									<InputLabel id="kategoria-label">Kategoria</InputLabel>
									<Select
										labelId="kategoria-label"
										id={this.id +"kategoria-select"}
										value={kategoria || "Ei kategoriaa"}
										label="Kategoria"
										onChange={this.onKategoriaChange}
									>
										<MenuItem value={'Ei kategoriaa'}>	Ei kategoriaa</MenuItem>
										<MenuItem value={'Jälki'}>			Jälki</MenuItem>
										<MenuItem value={'Partsa'}>			Partsa</MenuItem>
										<MenuItem value={'Ilmavainu'}>		Ilmavainu</MenuItem>
										<MenuItem value={'Tottis'}>			Tottis</MenuItem>
										<MenuItem value={'Muu reeni'}>		Muu reeni</MenuItem>
										<MenuItem value={'Muu y-toiminta'}>	Muu y-toiminta</MenuItem>
										
									</Select>
							</Grid>

							<Grid item xs={6}>
									<InputLabel id="koira-label">Koira</InputLabel>
									<Select
										labelId="koira-label"
										id={this.id +"koira-select"}
										value={koira || "Ei koiraa" }
										label="Koira"
										onChange={this.onKoiraChange}
									>
										<MenuItem value={'Ei koiraa'}>Ei koiraa</MenuItem>
										<MenuItem value={'Ykköskoira'}>Ykköskoira</MenuItem>
										<MenuItem value={'Kakkoskoira'}>Kakkoskoira</MenuItem>
										<MenuItem value={'Joku muu'}>Joku muu</MenuItem>
										
									</Select>
							</Grid>

							<Grid item xs={12}>
								<TextField
									id={item.id+"textfield"}
									style={styles.input}
									multiline
									fullWidth
									label={"Muistiinpanot"}
          							rows={5}
									variant={"filled"}
									onBlur={this.onTextChange}
									defaultValue={kommentti || ''} />
							</Grid>

							<Grid item xs={1}>
								<IconButton
									style={styles.icon}
									onClick={this.onPressDelete} >
										<DeleteIcon />
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

	onPvmChange = async (event) => {
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
