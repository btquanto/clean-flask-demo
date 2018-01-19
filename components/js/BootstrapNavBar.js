import React from 'react';
import ReactDOM from 'react-dom';

class NavBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="#">
                    <img src={this.props.icon} width="30" height="30" className="d-inline-block align-top" alt="" />
                    <span className="ml-2">{this.props.title}</span>
                </a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    {this.props.children}
                </div>
            </nav>
        );
    }
}

class NavItems extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="navbar-nav mr-auto">
                {this.props.children}
            </div>
        )
    }
}

export { NavBar, NavItems };