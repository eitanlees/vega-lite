import {keys} from '../util';
import {Config} from './../config';
import {AnyMark, isMarkDef} from './../mark';
import {GenericUnitSpec, NormalizedLayerSpec} from './../spec';
import {BOXPLOT, BoxPlot, BOXPLOT_PARTS, BoxPlotConfigMixins, BoxPlotDef, normalizeBoxPlot} from './boxplot';
import {ERRORBAR, ErrorBar, ERRORBAR_PARTS, ErrorBarConfigMixins, ErrorBarDef, normalizeErrorBar} from './errorbar';


export {BoxPlotConfig} from './boxplot';
export {ErrorBarConfig} from './errorbar';
export type UnitNormalizer = (spec: GenericUnitSpec<any, any>, config: Config)=> NormalizedLayerSpec;

/**
 * Registry index for all composite mark's normalizer
 */
const compositeMarkRegistry: {
  [mark: string]: {
    normalizer: UnitNormalizer,
    parts: string[]
  }
} = {};

export function add(mark: string, normalizer: UnitNormalizer, parts: string[]) {
  compositeMarkRegistry[mark] = {normalizer, parts};
}

export function remove(mark: string) {
  delete compositeMarkRegistry[mark];
}

export type CompositeMark = BoxPlot | ErrorBar;

export function getAllCompositeMarks() {
  return keys(compositeMarkRegistry);
}

export function getCompositeMarkParts(mark: string) {
  if (mark in compositeMarkRegistry) {
    return compositeMarkRegistry[mark].parts;
  }
  throw new Error(`Unregistered composite mark ${mark}`);
}

export type CompositeMarkDef = BoxPlotDef | ErrorBarDef;

export type CompositeAggregate = BoxPlot | ErrorBar;

export interface CompositeMarkConfigMixins extends BoxPlotConfigMixins, ErrorBarConfigMixins {}


add(BOXPLOT, normalizeBoxPlot, BOXPLOT_PARTS);
add(ERRORBAR, normalizeErrorBar, ERRORBAR_PARTS);

/**
 * Transform a unit spec with composite mark into a normal layer spec.
 */
export function normalize(
    // This GenericUnitSpec has any as Encoding because unit specs with composite mark can have additional encoding channels.
    spec: GenericUnitSpec<any, AnyMark>,
    config: Config
  ): NormalizedLayerSpec {

  const mark = isMarkDef(spec.mark) ? spec.mark.type : spec.mark;
  if (mark in compositeMarkRegistry) {
    const {normalizer} = compositeMarkRegistry[mark];
    return normalizer(spec, config);
  }

  throw new Error(`Invalid mark type "${mark}"`);
}
