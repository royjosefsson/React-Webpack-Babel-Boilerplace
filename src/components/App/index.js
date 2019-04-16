import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from 'react-google-autocomplete';

// @material-ui/core
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import moment from 'moment'

// components
import ApiHandler from '../../ApiHandler';
import SmhiTable from '../SmhiTable'

const styles = theme => ({
	card: {
		minWidth: 275,
		padding: 5
	},
	city: {
		fontSize: 20,
	},
	date: {
		fontSize: 11,
	},
	subcard: {
		margin: 10,
		minHeight: 200
	},
	root: {
		flexGrow: 1,
		fontSize: 20,
	},
	title: {
		fontSize: 14,
	},
	space_180: {
		height: 180,
	},
	currentWeather: {
		fontSize: 50,
	},

});


class App extends React.Component {
	state = {
		smhi: {
			places: [],
			periods: [],
			lastYearsData: [],
			currentData: [],
			selectedPlace: null,
			selectedPeriod: null,
			currentWeather: null
		}
	};

	setPlacesList = places => {
		this.setState({ smhi: { ...this.state.smhi, places } })
	}

	setSelectedPlace = selectedPlace => {
		this.setState({ smhi: { ...this.state.smhi, selectedPlace } })
	}

	setSelectedPeriod = selectedPeriod => {
		this.setState({ smhi: { ...this.state.smhi, selectedPeriod } })
	}

	setPeriods = periods => {
		this.setState({
			smhi: {
				...this.state.smhi,
				periods,
				selectedPlace: { ...this.state.smhi.selectedPlace, periods }
			}
		})
	}

	getCurrentWeather = place => {
		ApiHandler.SMHI.getCurrentWeather(place.id)
			.then(currentWeather => this.setState({ smhi: { ...this.state.smhi, currentWeather } }))
			.catch(() => this.setState({ smhi: { ...this.state.smhi, currentWeather: null } }));
	}

	selectPlace = place => {
		this.resetCompareData()
			.then(() => {
				this.getCurrentWeather(place);
				this.setSelectedPlace(place);
				ApiHandler.SMHI.getPeriods(place.id).then(periods => this.setPeriods(periods));
			});
	}
	selectPeriod = period => {
		this.setSelectedPeriod(period);
		let selectedPlace = this.state.smhi.selectedPlace
		let placePeriods = selectedPlace.periods.map(x => x.key);
		let capibleToCompare =
			placePeriods.includes('latest-hour') ||
			placePeriods.includes('latest-day') ||
			placePeriods.includes('latest-months') ||
			placePeriods.includes('corrected-archive');

		if (!capibleToCompare) {
			this.reset();
			throw new Error(`${selectedPlace.name} is missing important data`);
		} else {
			if (period.key !== 'corrected-archive') {
				ApiHandler.SMHI.getCurrentData(period)
					.then(currentData => {
						ApiHandler.SMHI.getLastYearsData(selectedPlace.id, currentData)
							.then(lastYearsData => {
								this.setState({
									smhi: {
										...this.state.smhi,
										lastYearsData,
										currentData
									}
								})
							});
					})
					.catch(() => this.setState({ smhi: { ...this.state.smhi, currentWeather: null } }))
			}
		}
	}

	reset = () => {
		this.setState({
			smhi: {
				...this.state.smhi,
				places: [],
				periods: [],
				lastYearsData: [],
				currentData: [],
				selectedPlace: null,
				selectedPeriod: null,
				currentWeather: null
			}
		});
	}

	resetCompareData = () => new Promise(resolve => {
		this.setState({
			smhi: {
				...this.state.smhi,
				lastYearsData: [],
				currentData: []
			}
		});
		resolve();
	})

	render = () => {
		const { classes } = this.props;
		const { selectedPlace, currentWeather } = this.state.smhi;
		const spacing = 16;


		return (
			<div>
				<Grid
					container
					className={classes.root}
					spacing={spacing}
					justify="center">
					<h1>Weather App</h1>
				</Grid>
				<Grid
					container
					className={classes.root}
					spacing={spacing}>
					<Grid item xs={12} sm={12} md={12} lg={12}>
						<Card className={classes.card}>
							<CardContent>
								<Grid item xs={12} sm={6} md={4} lg={4}
									container
									className={classes.root}
									justify="center">
									Google
									<Autocomplete
										style={{ width: '100%' }}
										onPlaceSelected={place => {
											this.reset();
											ApiHandler.SMHI.getPlaces(place).then(places => {
												console.log(places);
												if (places.length === 0) {
													this.reset();
													console.error(`Finns ingen data för ${place.name}`);
												} else if (places.length === 1) {
													this.setPlacesList(places);
													this.selectPlace(places[0]);
												} else {
													this.setPlacesList(places);
												}

											});
										}}
										types={['(cities)']}
										componentRestrictions={{ country: 'se' }}
									/>
								</Grid>

								<Grid
									className={classes.space_180}>
								</Grid>

								<Grid
									container
									className={classes.root}
									justify="center">
									SMHI
								</Grid>

								<Grid container className={classes.root}>
									<Grid item xs={12} sm={4} md={4} lg={4}>
										<Grid container className={classes.root}>
											<Grid item xs={6} sm={6} md={6} lg={6}>
												<Card className={classes.subcard}>
													<SmhiTable
														title='Places'
														type='places'
														data={this.state.smhi.places}
														onRowSelected={place => this.selectPlace(place)}
														value='name'
													/>
												</Card>
											</Grid>
											<Grid item xs={6} sm={6} md={6} lg={6}>
												<Card className={classes.subcard}>
													<SmhiTable
														title='Periods'
														type='periods'
														data={this.state.smhi.periods}
														onRowSelected={place => this.selectPeriod(place)}
														value='key'
													/>
												</Card>
											</Grid>
										</Grid>
									</Grid>
									<Grid item xs={12} sm={4} md={4} lg={4}>
										<Card className={classes.subcard}>
											<Grid
												container
												className={classes.root}
												justify="center">
												<Typography className={classes.title}>
													Current Weather
												</Typography>
											</Grid>
											<Grid
												container
												className={classes.root}
												justify="center">
												<Typography className={classes.date}>
													{moment().format('YYYY-MM-DD')}
												</Typography>
											</Grid>
											<Grid
												container
												className={classes.root}
												justify="center">
												<Typography className={classes.city}>
													{selectedPlace === null ? 'No City Selected' : selectedPlace.name}
												</Typography>
											</Grid>
											<Grid
												container
												className={classes.root}
												justify="center">
												<Typography className={classes.currentWeather}>
													{currentWeather === null ? '' : currentWeather}
												</Typography>
											</Grid>
										</Card>
									</Grid>
									<Grid item xs={12} sm={4} md={4} lg={4}>
										<Grid container className={classes.root}>
											<Grid item xs={6} sm={6} md={6} lg={6}>
												<Card className={classes.subcard}>
													<SmhiTable
														title={moment().format('YYYY')}
														type='comparison'
														data={this.state.smhi.currentData}
														value='formattedString'
													/>
												</Card>
											</Grid>
											<Grid item xs={6} sm={6} md={6} lg={6}>
												<Card className={classes.subcard}>
													<SmhiTable
														title={moment().subtract(1, 'year').format('YYYY')}
														type='comparison'
														data={this.state.smhi.lastYearsData}
														value='formattedString'
													/>
												</Card>
											</Grid>
										</Grid>
									</Grid>
								</Grid>
							</CardContent>
							<CardActions>
								<Button size="small"
									onClick={this.reset}>Reset</Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid>
			</div >
		);
	}
}

App.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);