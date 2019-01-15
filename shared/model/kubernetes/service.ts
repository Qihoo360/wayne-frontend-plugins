/* Do not change, this code is generated from Golang structs */


export class LoadBalancerIngress {
  ip: string;
  hostname: string;
}

export class LoadBalancerStatus {
  ingress: LoadBalancerIngress[];
}

export class ServiceStatus {
  loadBalancer: LoadBalancerStatus;
}

export class IntOrString {
}

export class ServicePort {
  name: string;
  protocol: string;
  port: number;
  targetPort: IntOrString;
  nodePort: number;
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
}

export class StatusCause {
  reason: string;
  message: string;
  field: string;
}

export class StatusDetails {
  name: string;
  group: string;
  kind: string;
  uid: string;
  causes: StatusCause[];
  retryAfterSeconds: number;
}

export class ListMeta {
  selfLink: string;
  resourceVersion: string;
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
}

export class Initializer {
  name: string;
}

export class Initializers {
  pending: Initializer[];
  result: Status;
}

export class OwnerReference {
  apiVersion: string;
  kind: string;
  name: string;
  uid: string;
  controller: boolean;
  blockOwnerDeletion: boolean;
}

export class Time {
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
}

export class KubeService {
  kind: string;
  apiVersion: string;
  metadata: ObjectMeta;
  spec: ServiceSpec;
  status: ServiceStatus;
}
