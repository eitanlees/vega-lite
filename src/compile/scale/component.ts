import {isArray} from 'vega';
import {ScaleChannel} from '../../channel';
import {Scale, ScaleType} from '../../scale';
import {Omit, some} from '../../util';
import {VgNonUnionDomain, VgScale} from '../../vega.schema';
import {Explicit, Split} from '../split';

/**
 * All VgDomain property except domain.
 * (We exclude domain as we have a special "domains" array that allow us merge them all at once in assemble.)
 */
// TODO: also exclude domainRaw and property implement the right scaleComponent for selection domain

export type ScaleComponentProps = Omit<VgScale, 'domain'>;

export class ScaleComponent extends Split<ScaleComponentProps> {
  public merged = false;

  public domains: VgNonUnionDomain[] = [];

  constructor(name: string, typeWithExplicit: Explicit<ScaleType>) {
    super(
      {}, // no initial explicit property
      {name} // name as initial implicit property
    );
    this.setWithExplicit('type', typeWithExplicit);
  }

  /**
   * Whether the scale definitely includes zero in the domain
   */
  public get domainDefinitelyIncludesZero() {
    if (this.get('zero') !== false) {
      return true;
    }
    const domains = this.domains;
    if (isArray(domains)) {
      return some(domains, d => isArray(d) && d.length === 2 && d[0] <= 0 && d[1] >= 0);
    }
    return false;
  }
}

// Using Mapped Type to declare type (https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types)
export type ScaleComponentIndex = {[P in ScaleChannel]?: ScaleComponent};

export type ScaleIndex = {[P in ScaleChannel]?: Scale};
