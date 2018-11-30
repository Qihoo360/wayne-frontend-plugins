/* Do not change, this code is generated from Golang structs */


export class LoadBalancerIngress {
  ip: string;
  hostname: string;
  //[LoadBalancerIngress:]


  //[end]
}

export class LoadBalancerStatus {
  ingress: LoadBalancerIngress[];
  //[LoadBalancerStatus:]


  //[end]
}

export class ServiceStatus {
  loadBalancer: LoadBalancerStatus;
  //[ServiceStatus:]


  //[end]
}

export class IntOrString {
  //[IntOrString:]


  //[end]
}

export class ServicePort {
  name: string;
  protocol: string;
  port: number;
  targetPort: IntOrString;
  nodePort: number;
  //[ServicePort:]


  //[end]
}

export class ServiceSpec {
  ports: ServicePort[];
  selector: {};
  clusterIP: string;
  type: string;
  externalIPs: string[];
  sessionAffinity: string;
  loadBalancerIP: string;
  loadBalancerSourceRanges: string[];
  externalName: string;
  externalTrafficPolicy: string;
  healthCheckNodePort: number;
  //[ServiceSpec:]


  //[end]
}

export class StatusCause {
  reason: string;
  message: string;
  field: string;
  //[StatusCause:]


  //[end]
}

export class StatusDetails {
  name: string;
  group: string;
  kind: string;
  uid: string;
  causes: StatusCause[];
  retryAfterSeconds: number;
  //[StatusDetails:]


  //[end]
}

export class ListMeta {
  selfLink: string;
  resourceVersion: string;
  //[ListMeta:]


  //[end]
}

export class Status {
  kind: string;
  apiVersion: string;
  metadata: ListMeta;
  status: string;
  message: string;
  reason: string;
  details: StatusDetails;
  code: number;
  //[Status:]


  //[end]
}

export class Initializer {
  name: string;
  //[Initializer:]


  //[end]
}

export class Initializers {
  pending: Initializer[];
  result: Status;
  //[Initializers:]


  //[end]
}

export class OwnerReference {
  apiVersion: string;
  kind: string;
  name: string;
  uid: string;
  controller: boolean;
  blockOwnerDeletion: boolean;
  //[OwnerReference:]


  //[end]
}

export class Time {
  //[Time:]


  //[end]
}

export class ObjectMeta {
  name: string;
  generateName: string;
  namespace: string;
  selfLink: string;
  uid: string;
  resourceVersion: string;
  generation: number;
  creationTimestamp: Time;
  deletionTimestamp: Time;
  deletionGracePeriodSeconds: number;
  labels: {};
  annotations: {};
  ownerReferences: OwnerReference[];
  initializers: Initializers;
  finalizers: string[];
  clusterName: string;
  //[ObjectMeta:]


  //[end]
}

export class KubeService {
  kind: string;
  apiVersion: string;
  metadata: ObjectMeta;
  spec: ServiceSpec;
  status: ServiceStatus;
  //[Service:]


  //[end]
}
