import * as React from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PatientList from './views/PatientList';
import NoteList from './views/NoteList';

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: PatientList,
      options: { title: 'Welcome' },
    },
    NoteList: {
      screen: NoteList

    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default Navigation;