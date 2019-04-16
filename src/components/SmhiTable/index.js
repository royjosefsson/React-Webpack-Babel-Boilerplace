import React from 'react';
import PropTypes from 'prop-types';

// @material-ui/core
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  }
});

function PlacesTable(props) {
  const { classes, data, onRowSelected, title, type, value } = props;
  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{title}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ?
            <TableRow>
              <TableCell component="th" scope="row"> {`No ${type}`} </TableCell>
            </TableRow> :
            data.map((row, i) => (
              <TableRow
                key={`row-${i}`}
                hover
                onClick={() => onRowSelected(row)}>
                <TableCell
                  component="th"
                  scope="row">
                  {row[value]}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

PlacesTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PlacesTable);
