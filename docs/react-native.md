## React Native

Generally, loki supports React Native out of the box. The existence of the status bar causes a number of flakey tests, as such, it is recommended
to disable the status bar where ever you invoke the `<Storybook />` component. 


```
import {StatusBar} from 'react-native';

<StatusBar hidden />
<Storybook />
```
