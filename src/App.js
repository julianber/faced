import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import CarRecognition from './components/CarRecognition/CarRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js'
import Clarifai from 'clarifai';

import './App.css';

const app = new Clarifai.App({
 apiKey: 'd4f79bb49ef744048d41e5d484d5205d'
});

const particlesOptions={
  "particles": {
    "number": {
      "value": 6,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#1b1e34"
    },
    "shape": {
      "type": "polygon",
      "stroke": {
        "width": 0,
        "color": "#000"
      },
      "polygon": {
        "nb_sides": 6
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 43.403120289774996,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 10,
        "size_min": 40,
        "sync": false
      }
    },
    "line_linked": {
      "enable": false,
      "distance": 200,
      "color": "#ffffff",
      "opacity": 1,
      "width": 2
    },
    "move": {
      "enable": true,
      "speed": 8,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": false,
        "mode": "grab"
      },
      "onclick": {
        "enable": false,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 400,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 2,
        "opacity": 8,
        "speed": 3
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
}

const initialState ={
  input: '',
  imageUrl:'',
  route: 'signin',
  isSignedIn : false,
  user: {
    id: '',
    name: '',
    password: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }
// ***** Comunicación entre servidores *****
  // componentDidMount() {
  //   fetch ('http://localhost:3000')
  //   .then(response => response.json())
  //   .then(console.log)
  // }

loadUser = (data) => {
  this.setState({user:{
    id: data.id,
    name: data.name,
    password: data.password,
    email: data.email,
    entries: data.entries,
    joined: data.joined
  }})
}

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    app.models.predict(
    Clarifai.GENERAL_MODEL,
    this.state.input)
    .then(response => {
      if (response.outputs[0].data.concepts[0].name === 'car')
      {
        fetch ('https://peaceful-caverns-21282.herokuapp.com/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id
            })
          })
          .then (reponse => reponse.json())
          .then (count => {
            this.setState(Object.assign(this.state.user, { entries:count}))
          })
      }
    })
    .catch (err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState(initialState)
    }else if (route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const {isSignedIn, imageUrl, route} = this.state;
    return (
      <div className="App">
      <Particles className='particles'
        params={particlesOptions}
        />
      <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
      {
        route === 'home'
        ?
        <div>
          <Logo />
          <Rank name = {this.state.user.name} entries = {this.state.user.entries} />
          <ImageLinkForm
            onInputChange ={this.onInputChange}
            onButtonSubmit={this.onButtonSubmit}
          />
          <CarRecognition imageUrl={imageUrl}/>
        </div>
        : (
           route === 'signin'
           ? <Signin loadUser= {this.loadUser} onRouteChange={this.onRouteChange}/>
           : <Register loadUser= {this.loadUser} onRouteChange={this.onRouteChange} />
          )
      }
      </div>
    );
  }
}

export default App;
