import * as grpc from '@grpc/grpc-js';
import { loadPackageDefinition } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { join } from 'path';
import { promisify } from 'util';

import { GrpcClientContextInterceptor } from '@app/context';

export function createGrpcUnaryClient<T extends object>(params: {
  packageName: string;
  serviceName: string;
  protoFile: string;
  url: string;
  methods: readonly string[];
  contextInterceptor: GrpcClientContextInterceptor;
}): T {
  const packageDefinition = loadSync(
    join(process.cwd(), 'libs/proto-schema/proto', params.protoFile),
    {
      keepCase: false,
      longs: String,
      enums: Number,
      defaults: true,
      oneofs: true,
    },
  );
  const packages = loadPackageDefinition(packageDefinition) as Record<
    string,
    Record<string, new (...args: any[]) => grpc.Client>
  >;
  const ServiceClient = packages[params.packageName]?.[params.serviceName];

  if (!ServiceClient) {
    throw new Error(`gRPC service ${params.packageName}.${params.serviceName} was not loaded`);
  }

  const client = new ServiceClient(params.url, grpc.credentials.createInsecure(), {
    interceptors: [params.contextInterceptor.interceptor()],
  });
  const methods: Record<string, unknown> = {};

  for (const method of params.methods) {
    const implementation = (client as unknown as Record<string, (...args: unknown[]) => unknown>)[
      method
    ];
    if (typeof implementation !== 'function') {
      throw new Error(`gRPC method ${params.serviceName}.${method} was not loaded`);
    }
    methods[method] = promisify(implementation.bind(client));
  }

  return methods as T;
}
