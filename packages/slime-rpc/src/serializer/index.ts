import { SerializerSource } from './types';
import { ArrayOrSetSerializer } from './ArrayOrSetSerializer';
import { MapSerializer } from './MapSerializer';
import { DefaultObjectSerializer } from './DefaultObjectSerializer';
import { PrimitiveSerializer } from './PrimitiveSerializer';
import { StructuredCloneableSerializer } from './StructuredCloneableSerializer';
import { DefaultEventSerializer } from './DefaultEventSerializer';
import { AbortSignalSerializer } from './AbortSignalSerializer';
import { DefaultClassSerializer } from './DefaultClassSerializer';

export * from './RpcSerializer';

export const structureClonableSerializers: SerializerSource<unknown>[] = [
	new PrimitiveSerializer(),
	new ArrayOrSetSerializer(),
	new MapSerializer(),
	new StructuredCloneableSerializer(),
    new AbortSignalSerializer(),
    new DefaultEventSerializer(), // event has some minor gotchas
	new DefaultClassSerializer(), // this must be before default object serializer, because DefaultObjectSerializer is the "oh no, final option!"
	new DefaultObjectSerializer(),
];
