import React from 'react';
import { Bucket as SharedBucket } from '../../../shared';

const Bucket = (props) => <SharedBucket dataSource="models" {...props} />;

export default Bucket;