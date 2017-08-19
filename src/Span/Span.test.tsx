import test from 'ava';
import * as React from 'react';
import { shallow, mount } from 'enzyme';

import Span from './Span';

test('shallow', (t) => {
  const wrapper = shallow(<Span>Hi</Span>);
  t.is(wrapper.contains(<span>Hi</span>), true);
});

test('mount', (t) => {
  const wrapper = mount(<Span>Hi</Span>);
  const fooInner = wrapper.find('span');
  t.is(fooInner.is('span'), true);
});
