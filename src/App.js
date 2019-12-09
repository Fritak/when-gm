import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from '@material-ui/core/FormHelperText';
import Paper from '@material-ui/core/Paper';


const nearestRank = (ranks, rank) =>
{
    let fRank = undefined;

    ranks.forEach((item, index) =>
    {
        if (fRank === undefined && item > rank) { fRank = index === 0 ? 0 : index-1;}
    });

    return fRank;
};

const getDate = (minutes) =>
{
    let dt = new Date();
    dt.setMinutes( dt.getMinutes() + minutes );
    return dt.getDate() + ". " + (dt.getMonth() + 1) + ". " + dt.getFullYear();
};

let portionToTime = [0, 0.1, 0.25, 0.5, 0.75, 0.85, 1]; // portion of time for this role
let waitTimes = [0, 1, 5, 2.5]; // average wait times (lowest possible)
let gameTime = 18; // avg game time in mins
let ranks = [0, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
let ranksText = [undefined, 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'top500'];


class whenGm extends React.Component
{
    state =
    {
        hours: 14,
        role: 2,
        portion: 6,
        time: 2,
        rank: 2500,
        invested: 1,
        ranked: [{time: 50900, rank: 3000}],
    };

    componentDidUpdate(prevProps, prevState, snapshot)
    {
        if (prevState.portion !== this.state.portion ||
            prevState.hours !== this.state.hours ||
            prevState.role !== this.state.role ||
            prevState.rank !== this.state.rank ||
            prevState.invested !== this.state.invested)
        {
            // sets time for this role and 1 day
            this.setState({time: this.state.hours * portionToTime[this.state.portion] / 7});

            // every 350 SR is waiting time longer
            let waitTimePerMatch = 0;
            let timePerMatch = 0;
            let newRank = parseInt(this.state.rank);
            let timeItTook = 0;
            let ranked = [];
            let avgWr = parseInt(100 / this.state.invested); // 3 means every 33match is unexpected win, ie 53% winrate

            let lastRank = nearestRank(ranks, this.state.rank);

            // 10000 games
            let i = 0;
            for (i = 0; i < 10000; i++)
            {
                waitTimePerMatch = waitTimes[this.state.role] * (1 + (Math.abs(2500 - newRank) / 350));
                timePerMatch = gameTime + waitTimePerMatch;
                timeItTook += timePerMatch;

                // unexpected win
                if (i % avgWr === 0)
                {
                    newRank += 25;
                }

                // lose/win every second match
                newRank += i % 2 === 0 ? 25 : -25;
                // has ranked?
                if (newRank > ranks[lastRank+1])
                {
                    lastRank++;
                    ranked.push({time: timeItTook, rank: newRank})
                }

                if (newRank > 4500)
                {
                    break;
                }
            }

            this.setState({ranked: ranked});
        }
    }

    render()
    {
        const { classes } = this.props;
        console.log(this.state.ranked);
        const items = this.state.ranked.map((item, key) =>
            <Typography key={key} gutterBottom>
                {ranksText[nearestRank(ranks, item.rank)]}: {getDate(item.time/this.state.time*24)}
            </Typography>
        );

        return (
            <Container component="main" maxWidth="md">
                <Box mt={8} align="center">
                    <h1>When I will be GM?</h1>
                </Box>

                <form className={classes.form} noValidate>
                    <FormControl className={classes.formControl}>
                        <TextField type="number"
                                   id="hours"
                                   label="Hours"
                                   value={this.state.hours}
                                   onChange={event => { this.setState({hours: event.target.value });}}
                        />
                        <FormHelperText>How many hours do you play per <b>week</b>?</FormHelperText>
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel id="role">Role</InputLabel>
                        <Select
                            labelId="role"
                            id="role"
                            value={this.state.role}
                            onChange={event => { this.setState({role: event.target.value });}}
                        >
                            <MenuItem value={1}>Tank</MenuItem>
                            <MenuItem value={2}>Damage</MenuItem>
                            <MenuItem value={3}>Support</MenuItem>
                        </Select>
                        <FormHelperText>What role do you want to calculate?</FormHelperText>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <InputLabel id="portion">Onetrick?</InputLabel>
                        <Select
                            labelId="portion"
                            id="portion"
                            value={this.state.portion}
                            onChange={event => { this.setState({portion: event.target.value });}}
                        >
                            <MenuItem value={1}>One of every ten games</MenuItem>
                            <MenuItem value={2}>Less than one third</MenuItem>
                            <MenuItem value={3}>About half of time</MenuItem>
                            <MenuItem value={4}>Approximately three quarters</MenuItem>
                            <MenuItem value={5}>Almost exclusively</MenuItem>
                            <MenuItem value={6}>I am one-tricking this role</MenuItem>
                        </Select>
                        <FormHelperText>How much do you play this role?</FormHelperText>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <TextField type="number"
                                   id="rank"
                                   label="Rank"
                                   value={this.state.rank}
                                   onChange={event => { this.setState({rank: event.target.value });}}
                        />
                        <FormHelperText>What is your rank?</FormHelperText>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <InputLabel id="invested">Tryhard?</InputLabel>
                        <Select
                            labelId="invested"
                            id="invested"
                            value={this.state.invested}
                            onChange={event => { this.setState({invested: event.target.value });}}
                        >
                            <MenuItem value={1}>Why? My aim is true.</MenuItem>
                            <MenuItem value={2}>Sometimes I watch one trick for every hero</MenuItem>
                            <MenuItem value={3}>Replay, twich & reddit are my friends.</MenuItem>
                            <MenuItem value={4}>Bruh, I have my personal coach.</MenuItem>
                        </Select>
                        <FormHelperText>Do you study your games?</FormHelperText>
                    </FormControl>
                </form>
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justify="center"
                >

                    <Grid item xs={12}>
                        <Paper className={classes.paper} >
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm container>
                                    <Grid item xs container direction="column" spacing={2}>
                                        <Grid item xs>
                                            <Typography gutterBottom>
                                                So, you play this role {this.state.time.toFixed(2)}h each day.
                                            </Typography>
                                            <Typography gutterBottom>
                                                You will reach:
                                            </Typography>
                                            {items}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                </Grid>
            </Container>
        );
    }
}


const styles = theme => ({
    paper: {
        padding: theme.spacing(1),
        width: 300,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(5),
    },
    formControl: {
        margin: theme.spacing(4),
    },
});

whenGm.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(whenGm);