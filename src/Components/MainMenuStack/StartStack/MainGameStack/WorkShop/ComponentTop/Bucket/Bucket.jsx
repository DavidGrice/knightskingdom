import React from 'react';
import { Bucket as SharedBucket } from '../../../shared';

const Bucket = (props) => <SharedBucket dataSource="bricks" {...props} />;

export default Bucket;