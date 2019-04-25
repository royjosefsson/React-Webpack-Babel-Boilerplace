import React from 'react';
import PropTypes from 'prop-types';

// @material-ui/core
import { withStyles } from '@material-ui/core/styles';

const styles = ({
	red: {
		color: 'red'
	}

});


class App extends React.Component {
	state = {
	};

	render = () => {
		const { classes } = this.props;

		return (
			<h1 className={classes.red}>Hello RWB!</h1>
		);
	}
}

App.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);