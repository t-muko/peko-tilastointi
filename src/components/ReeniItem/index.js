import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Checkbox from 'material-ui/Checkbox';
// import TextField from 'material-ui/TextField';
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
		const { pvm, kategoria, tunnit, alakategoria, kommentti } = item.data;

		console.log('TodoItem.render: ', item.path, ', kommentti: ', kommentti);
		return (
			<LocalizationProvider dateAdapter={AdapterDateFns}>

				<Dialog onClose={() => {
					// console.debug("Closing");
					this.props.closeF()
				}} open={true}>

					<Box sx={{ flexGrow: 1 }}>
						<Grid container spacing={3} p={2} minHeight='200px'>
							<Grid item xs={4}>
								<MobileDatePicker
									label="Date mobile"
									inputFormat="MM/dd/yyyy"
									value={new Date()}
									onChange={(e) => {
										console.log("Date", e)
									}}
									renderInput={(params) => <TextField id={this.id + "foo"} {...params} />}
								/>
							</Grid>

							<Grid item xs={4}>
									<InputLabel id="demo-simple-select-label">Kesto</InputLabel>
									<Select
										labelId="demo-simple-select-label"
										id={this.id +"demo-simple-select"}
										value={tunnit || 1}
										label="Kesto"
										onChange={this.onKestoChange}
									>
										<MenuItem value={0.5}>0,5h</MenuItem>
										<MenuItem value={1}>1h</MenuItem>
										<MenuItem value={1.5}>1,5h</MenuItem>
										<MenuItem value={2}>2h</MenuItem>
										<MenuItem value={3}>3h</MenuItem>
										<MenuItem value={4}>4h</MenuItem>
										<MenuItem value={5}>5h</MenuItem>

									</Select>
							</Grid>

							<Grid item xs={4}>
									<InputLabel id="kategoria-label">Kategoria</InputLabel>
									<Select
										labelId="kategoria-label"
										id={this.id +"kategoria-select"}
										value={kategoria}
										label="Kategoria"
										onChange={this.onKategoriaChange}
									>
										<MenuItem value={'Jälki'}>Jälki</MenuItem>
										<MenuItem value={'Partsa'}>Partsa</MenuItem>
										<MenuItem value={'Ilmavainu'}>Ilmavainu</MenuItem>
										<MenuItem value={'Kokous'}>Kokous</MenuItem>
										<MenuItem value={'Hälytys'}>Hälytys</MenuItem>
										<MenuItem value={'Hälytysharjoitus'}>Hälytysharjoitus</MenuItem>
										
									</Select>
							</Grid>

							<Grid item xs={12}>
								<TextField
									id={item.id+"textfield"}
									style={styles.input}
									multiline="true"
          							rows={5}
									variant={"filled"}
									underlineShow={false}
									hintText={kommentti ? undefined : 'Omat kommentit. Miten reeni meni?'}
									onChange={this.onTextChange}
									value={kommentti || ''} />
							</Grid>

							<Grid item xs={1}>
								<IconButton
									style={styles.icon}
									secondary
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

	onTextChange = async (event, newValue) => {
		const { item } = this.props;
		await item.update({
			kommentti: newValue
		});
	};

	onKestoChange = async (event) => {
		const { item } = this.props;
		await item.update({
			tunnit: event.target.value
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
