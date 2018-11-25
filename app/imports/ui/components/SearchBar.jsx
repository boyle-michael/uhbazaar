import _ from 'lodash';
import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Redirect, Route, withRouter } from 'react-router-dom';
import { Search, Grid } from 'semantic-ui-react';
import ShowItem from './ShowItem';
import { Items } from '../../api/item/item';

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      redirect: false,
      isLoading: false,
      value: '',
      results: [],
    };
  }

  setRedirect = () => {
    this.setState({
      redirect: true,
    });
  }

  renderRedirect = () => {
    this.setRedirect();
    if (this.state.redirect) {
      return <Route exact path="/item" render={() => (
          <Redirect to="/item"/>
      )}/>;
    }
  }

  componentWillMount() {
    this.resetComponent();
  }

  nextStep = () => {
    const { step } = this.state;
    this.setState({
      step: step + 1,
    });
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

  handleResultSelect = (e, { result }) => {
    this.setState({ value: result._id });
    this.nextStep();
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value });

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent();

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i');
      const isMatch = result => re.test(result.title) || re.test(result.price) || re.test(result.location);

      this.setState({
        isLoading: false,
        results: _.filter(Items.find({}).fetch(), isMatch),
      });
      return true;
    }, 300);
  }

  render() {
    const { isLoading, value, results } = this.state;
    const gridStyle = { marginRight: '0' };
    const { step } = this.state;
    switch (step) {
      case 1:
        return (
            <Grid style={gridStyle}>
              <Grid.Column width={6}>
                <Search
                    placeholder='Search by item'
                    loading={isLoading}
                    onResultSelect={this.handleResultSelect}
                    onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
                    results={results}
                    value={value}
                    {...this.props}
                />
              </Grid.Column>
            </Grid>
        );
      case 2:
        return (
            <Redirect to={`/item/${this.state.value}`}/>
        );
      default:
        return false;
    }

  }
}

/** Require an array of Stuff documents in the props. */
SearchBar.propTypes = {
  items: PropTypes.array.isRequired,
  ready: PropTypes.string.isRequired,
};

/** withTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker */
export default withTracker(() => {
  // Get access to Stuff documents.
  const subscription = Meteor.subscribe('Items');
  return {
    items: Items.find({}).fetch(),
    ready: (subscription.ready()).toString(),
  };
})(SearchBar);
