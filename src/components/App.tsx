import React, { Component } from 'react';
import Button from '@mui/material/Button';
import { FirebaseContext } from '@components/Firebase/Firebase';

import { observer } from "mobx-react";
import { makeObservable, observable, action } from 'mobx';

import FloatingActionButton from '@mui/material/Fab';
import ContentAddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';

import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Reenit from '@components/Reenit';
import Tilasto from '@components/Tilasto';
import Info from '@components/Info';

interface AppContext {
	rootStore: any;
}

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const styles = {
	container: {
		position: 'absolute',
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		display: 'flex',
		flexDirection: 'column'
	},
	header: {
		padding: 20,
		paddingBottom: 0,
		paddingRight: 10
	},
	headerRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center'
	},
	h1: {
		margin: 0,
		padding: 0
	},
	h3: {
		marginBottom: 0
	},
	logo: {
		height: 50,
		marginRight: 10
	},
	add: {
		position: 'fixed',
		bottom: 20,
		right: 20
	},
	login: {
		position: 'fixed',
		bottom: "50%",
	},
	logout: {
		position: 'absolute',
		top: '1em',
		right: '1em'
	},
	info: {
		position: 'absolute',
		top: '1em',
		right: '3em'
	},
	installBanner: {
		position: 'fixed',
		left: '50%',
		transform: 'translateX(-50%)',
		bottom: 12,
		zIndex: 1400,
		padding: '8px 12px',
		borderRadius: 8,
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		fontSize: 14,
		maxWidth: 'min(92vw, 520px)'
	}
} as const;

export class App extends Component {
	static contextType = FirebaseContext
	declare context: AppContext;

	showInfo = false;
	uid: string | null = null;
	deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
	showInstallPrompt = false;
	showIosInstallHint = false;

	constructor(props: any) {
		super(props)

		makeObservable(this, {
			showInfo: observable,
			deferredInstallPrompt: observable.ref,
			showInstallPrompt: observable,
			showIosInstallHint: observable,
			toggleShowInfo: action,
			handleBeforeInstallPrompt: action.bound,
			handleAppInstalled: action.bound,
			showInstallHintsIfNeeded: action.bound,
			hideInstallPrompt: action.bound,
			onInstallClick: action.bound
		})

	}

	toggleShowInfo = () => {
		this.showInfo = !this.showInfo
	}

	handleBeforeInstallPrompt(event: Event) {
		event.preventDefault();
		this.deferredInstallPrompt = event as BeforeInstallPromptEvent;
		this.showInstallPrompt = true;
	}

	handleAppInstalled() {
		this.deferredInstallPrompt = null;
		this.showInstallPrompt = false;
		this.showIosInstallHint = false;
	}

	showInstallHintsIfNeeded() {
		const ua = window.navigator.userAgent.toLowerCase();
		const isIos = /iphone|ipad|ipod/.test(ua);
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

		if (isIos && !isStandalone) {
			this.showIosInstallHint = true;
		}
	}

	hideInstallPrompt() {
		this.showInstallPrompt = false;
		this.showIosInstallHint = false;
	}

	async onInstallClick() {
		if (!this.deferredInstallPrompt) {
			return;
		}

		await this.deferredInstallPrompt.prompt();
		const choice = await this.deferredInstallPrompt.userChoice;

		if (choice.outcome === 'accepted') {
			this.deferredInstallPrompt = null;
			this.showInstallPrompt = false;
		}
	}

	render() {
		const context = this.context;
		// Reading showInfo is necessary to trigger MobX re-render when it changes
		const showInfo = this.showInfo
		const showInstallPrompt = this.showInstallPrompt
		const showIosInstallHint = this.showIosInstallHint
		const userEmail = context.rootStore.sessionStore.authUser ? context.rootStore.sessionStore.authUser.email : "nobody"

		return (
			<div className="App">
				<header className="App-header">
					<div style={styles.container}>
						<div style={styles.header}>
							<div style={styles.headerRow}>
								<img src='/tilasto128.png' alt='logo' style={styles.logo} />
								<h1 style={styles.h1}>Peko-toimintapäiväkirja</h1>
							</div>
						</div>
						{context.rootStore.sessionStore.userOk && <div>
							<h3>{userEmail}</h3>

							{showInfo && <Info toggleShowInfoF={this.toggleShowInfo} />}

							<Accordion slotProps={{ transition: { mountOnEnter: true } }}>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									aria-controls="panel1a-content"
									id="panel1a-header"
								>
									<Typography variant="body1" gutterBottom  >Tilastot</Typography>

								</AccordionSummary>
								<AccordionDetails>
									<Tilasto />
								</AccordionDetails>
							</Accordion>

							<Reenit />

							<Box sx={{ p: '40px' }}></Box>

							<FloatingActionButton style={styles.add} onClick={this.onPressAdd}>
								<ContentAddIcon />
							</FloatingActionButton>
						</div>}


					</div>
					{!context.rootStore.sessionStore.userOk && <Box style={styles.login}><Button variant="contained" onClick={() => {
						context.rootStore.firebase.autentikoi();
					}}
					>Login</Button>
						<Box sx={{ mt: '5em', fontSize: 10 }}>
							Jos login ei onnistu, voit kokeilla ensin logata Googlen palveluista kokonaan ulos ja sitten kokeilla kirjautumista uudelleen.<br />
							Voit joutua navigoimaan uudelleen peko-tilastointisivulle.<br />
							<a href="https://accounts.google.com/Logout" target="_blank" rel="noopener noreferrer"><LogoutIcon sx={{ color: 'white' }} /></a></Box>
					</Box>}


					{context.rootStore.sessionStore.userOk && <Tooltip title="Info">
						<IconButton color="primary" aria-label="info" style={styles.info}
							onClick={() => { this.toggleShowInfo(); }}
						><InfoIcon /></IconButton></Tooltip>}

					{context.rootStore.sessionStore.userOk && <Tooltip title="Kirjaudu ulos"><IconButton color="primary" aria-label="logout" style={styles.logout} onClick={() => {
						context.rootStore.firebase.logout();
					}}
					><LogoutIcon /></IconButton></Tooltip>}

					{(showInstallPrompt || showIosInstallHint) && (
						<Box sx={styles.installBanner} className="install-banner">
							{showInstallPrompt ? (
								<>
									<Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left' }}>
										Asenna sovellus puhelimesi aloitusnaytolle nopeaa kayttoa varten.
									</Typography>
									<Button variant="contained" size="small" onClick={this.onInstallClick}>
										Asenna
									</Button>
								</>
							) : (
								<Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left' }}>
									iPhone/iPad: avaa Safari-valikko ja valitse Lisaa Koti-valikkoon.
								</Typography>
							)}
							<Button variant="text" size="small" onClick={this.hideInstallPrompt}>
								Sulje
							</Button>
						</Box>
					)}

				</header>

			</div>

		);
	}

	componentDidMount() {
		const context = this.context;
		this.uid = context.rootStore.sessionStore.authUser ? context.rootStore.sessionStore.authUser.uid : null
		window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', this.handleAppInstalled);
		this.showInstallHintsIfNeeded();
	}

	componentWillUnmount() {
		window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
		window.removeEventListener('appinstalled', this.handleAppInstalled);
	}

	onPressAdd = async () => {
		try {
			await this.context.rootStore.reeniFirestore.addDefaultReeni();
		}
		catch (err) {
			console.error("Virhe lisäyksessä", err)
		}
	};
}



export default (observer(App));
