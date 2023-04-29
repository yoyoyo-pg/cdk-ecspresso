#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkEcspressoStack } from '../lib/cdk-ecspresso-stack';

const app = new cdk.App();
new CdkEcspressoStack(app,'CdkEcspressoStack');
