import React from 'react'
import { List } from '@stardust-ui/react'

const imgStyle = { display: 'block', width: 28, borderRadius: 9999 }

const items = [
  {
    key: 'irving',
    media: <img src="public/images/avatar/small/matt.jpg" style={imgStyle} />,
    header: 'Irving Kuhic',
    headerMedia: '7:26:56 AM',
    content: 'Program the sensor to the SAS alarm through the haptic SQL card!',
  },
  {
    key: 'skyler',
    media: <img src="public/images/avatar/small/steve.jpg" style={imgStyle} />,
    header: 'Skyler Parks',
    headerMedia: '11:30:17 PM',
    content: 'Use the online FTP application to input the multi-byte application!',
  },
  {
    key: 'dante',
    media: <img src="public/images/avatar/small/nom.jpg" style={imgStyle} />,
    header: 'Dante Schneider',
    headerMedia: '5:22:40 PM',
    content: 'The GB pixel is down, navigate the virtual interface!',
  },
]

const ListExampleSelection = ({ knobs }) => <List debug={knobs.debug} items={items} />

export default ListExampleSelection
