import {
  Q,
  addEventListenerOnce,
  Processor,
  render,
  delay,
  setState
} from './utils';

import Main from '../components/Main.html';

import main from './main';
import { Card } from './templates';
import { task, getWeatherAndCityDataThenSetState } from './utils';
import { State } from './types';

const processedMain: string = new Processor(Main, [
  {
    match: '%CardTypeA%',
    value: Card({
      type: 'A',
      temp: 0.0,
      description: '...',
      humidity: 0.0
    })
  },
  {
    match: '%CardTypeB%',
    value: Array(7)
      .fill(
        Card({
          type: 'B',
          temp: 0.0
        })
      )
      .join('')
  }
]).process();

export default function home() {
  const View = Q('.View') as HTMLElement;
  const Home = Q('.Home') as HTMLElement;
  const Button = Q('.Home button') as HTMLButtonElement;
  const Nav = Q('.Nav') as HTMLElement | any;

  //add inert (polyfill) attribute for accessibility purpose(s)
  Nav.setAttribute('inert', true);

  const mountMain = () => {
    render(processedMain, View, { adjacency: 'beforeend' }, () => main());
    Home.classList.add('hide');
    addEventListenerOnce(Home, () => {
      View.removeChild(Home);
      Nav.classList.remove('hide');
      Nav.inert = false;
    });
  };

  const handleExploreButtonClick = () => {
    Button.disabled = true;
    Button.textContent = 'Starting...';

    const locationRequestSuccess = (position: Position) => {
      const { latitude, longitude } = position.coords;

      delay(700).then(() => {
        mountMain();
        delay(700).then(() => {
          getWeatherAndCityDataThenSetState(latitude, longitude, null);
        });
      });
    };

    const locationRequestFailure = () => {
      delay(700).then(() => {
        mountMain();
        delay(700).then(() => {
          getWeatherAndCityDataThenSetState(40.69, -73.96);
        });
      });
    };

    const locationRequestOptions = {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000
    };

    navigator.geolocation.getCurrentPosition(
      locationRequestSuccess,
      locationRequestFailure,
      locationRequestOptions
    );
  };

  if (Button) {
    Button?.addEventListener('click', handleExploreButtonClick);
    Q('.Nav .location')!.addEventListener('click', () => task.execute());
  }

  //load appState from localStorage if present
  if (navigator.cookieEnabled) {
    const weatherAppState: Omit<State, 'setState'> = JSON.parse(
      localStorage.weatherAppState
    );

    if (weatherAppState) {
      delay(1000).then(() => {
        mountMain();
        delay(1000).then(() => setState({ ...weatherAppState }));
      });
    }
  }
}
