import React, { Component } from 'react'
import { connect } from 'react-redux'

class Home extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>Home</div>
        )
    }
}

export default connect((state, props) => ({}), dispatch => ({}))(Home)