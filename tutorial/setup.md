# Topology

list of hardware:

- 3 computers
- 5 raspberry pi
- 1 router
- 1 switch

#### Networking

Router is connected to internet and has itself default gateway = `192.168.0.1`, then, a switch is connect to the router, and finally raspberry pi and all computers are connected to either router or switch.

#### Computers

Two of the computers are used as master-node with ip = `192.168.0.201` and `192.168.0.202`.
The last computer (`192.168.0.203`) is use as load balancer for both masternode and web application.

#### Raspberry pi

Each pi as ip raning from `192.168.0.111` to `192.168.0.115`

#### OS

All computers use `Ubuntu 19.10`.

All raspberry pi use `Rasbian Strech`

# Pre-setup

## Setup for all node

1. Disable swap memory
2. Install kubectl kubeadm kubelet

# Stepup

## Setup for Loadbalancer (`192.168.0.203`)

### Installing cfssl

1 Download the binaries.

```shell
wget https://pkg.cfssl.org/R1.2/cfssl_linux-amd64
wget https://pkg.cfssl.org/R1.2/cfssljson_linux-amd64
```

2- Add the execution permission to the binaries.

```shell
chmod +x cfssl*
```

3- Move the binaries to /usr/local/bin.

```shell
sudo mv cfssl_linux-amd64 /usr/local/bin/cfssl
sudo mv cfssljson_linux-amd64 /usr/local/bin/cfssljson
```

4- Verify the installation.

```shell
cfssl version
```

### Installing HAProxy

```shell
sudo apt-get update
sudo apt-get install haproxy
```

Edit configuration of HAProxy

```shell
sudo gedit /etc/haproxy/haproxy.cfg
```

**/etc/haproxy/haproxy.cfg**

```yaml
global
...

defaults
...

frontend kubernetes
bind 192.168.0.203:6443
option tcplog
mode tcp
default_backend kubernetes-master-nodes

backend kubernetes-master-nodes
mode tcp
balance roundrobin
option tcp-check
server master1 192.168.0.201:6443 check fall 3 rise 2
server master2 192.168.0.202:6443 check fall 3 rise 2

frontend web-http
bind 192.168.0.203:80
reqadd X-Forwarded-Proto:\ http
default_backend web-worker-nodes

backend web-worker-nodes
balance roundrobin
server wnode1 192.168.0.111:31001 check
server wnode2 192.168.0.112:31001 check
server wnode3 192.168.0.113:31001 check
server wnode4 192.168.0.114:31001 check
server wnode5 192.168.0.115:31001 check
```

Restart HAProxy

```shell
sudo systemctl restart haproxy
```

#### Generating the TLS certificates

Create the certificate authority configuration file.

```json
cat > ca-config.json
{
  "signing": {
    "default": {
      "expiry": "8760h"
    },
    "profiles": {
      "kubernetes": {
        "usages": ["signing", "key encipherment", "server auth", "client auth"],
        "expiry": "8760h"
      }
    }
  }
}
```

Create the certificate authority signing request configuration file.

```json
cat > ca-csr.json
{
  "CN": "Kubernetes",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
  {
    "C": "IE",
    "L": "Cork",
    "O": "Kubernetes",
    "OU": "CA",
    "ST": "Cork Co."
  }
 ]
}
```

Generate the certificate authority certificate and private key.

```shell
cfssl gencert -initca ca-csr.json | cfssljson -bare ca
```

Create the certificate signing request configuration file.

```json
cat > kubernetes-csr.json
{
  "CN": "kubernetes",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
  {
    "C": "IE",
    "L": "Cork",
    "O": "Kubernetes",
    "OU": "Kubernetes",
    "ST": "Cork Co."
  }
 ]
}
```

Generate the certificate and private key.

```shell
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -hostname=192.168.0.201,192.168.0.202,192.168.0.203,127.0.0.1,loadbalancer,master1,master2,kubernetes.default -profile=kubernetes kubernetes-csr.json | cfssljson -bare kubernetes
```

Copy generated certificat to each node

```shell
scp ca.pem kubernetes.pem kubernetes-key.pem username@192.168.0.201:~
scp ca.pem kubernetes.pem kubernetes-key.pem username@192.168.0.202:~
scp ca.pem kubernetes.pem kubernetes-key.pem username@192.168.0.203:~
scp ca.pem kubernetes.pem kubernetes-key.pem username@192.168.0.111:~
scp ca.pem kubernetes.pem kubernetes-key.pem username@192.168.0.112:~
scp ca.pem kubernetes.pem kubernetes-key.pem username@192.168.0.113:~
scp ca.pem kubernetes.pem kubernetes-key.pem username@192.168.0.114:~
scp ca.pem kubernetes.pem kubernetes-key.pem username@192.168.0.115:~
```

## Installing and configuring Etcd for Master node (`192.168.0.201`, `192.168.0.202`)

Create configuration for etcd

```shell
sudo mkdir /etc/etcd /var/lib/etcd
sudo mv ~/ca.pem ~/kubernetes.pem ~/kubernetes-key.pem /etc/etcd
```

Install etcd

```shell
wget https://github.com/coreos/etcd/releases/download/v3.3.9/etcd-v3.3.9-linux-amd64.tar.gz
tar xvzf etcd-v3.3.9-linux-amd64.tar.gz
sudo mv etcd-v3.3.9-linux-amd64/etcd* /usr/local/bin/
```

Configure etcd

```shell
sudo gedit /etc/systemd/system/etcd.service
```

**/etc/systemd/system/etcd.service** for `192.168.0.201`

```yaml
[Unit]
Description=etcd
Documentation=https://github.com/coreos

[Service]
ExecStart=/usr/local/bin/etcd \
  --name 192.168.0.201 \
  --cert-file=/etc/etcd/kubernetes.pem \
  --key-file=/etc/etcd/kubernetes-key.pem \
  --peer-cert-file=/etc/etcd/kubernetes.pem \
  --peer-key-file=/etc/etcd/kubernetes-key.pem \
  --trusted-ca-file=/etc/etcd/ca.pem \
  --peer-trusted-ca-file=/etc/etcd/ca.pem \
  --peer-client-cert-auth \
  --client-cert-auth \
  --initial-advertise-peer-urls https://192.168.0.201:2380 \
  --listen-peer-urls https://192.168.0.201:2380 \
  --listen-client-urls https://192.168.0.201:2379,http://127.0.0.1:2379 \
  --advertise-client-urls https://192.168.0.201:2379 \
  --initial-cluster-token etcd-cluster-0 \
  --initial-cluster 192.168.0.201=https://192.168.0.201:2380,192.168.0.202=https://192.168.0.202:2380 \
  --initial-cluster-state new \
  --data-dir=/var/lib/etcd
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**/etc/systemd/system/etcd.service** for `192.168.0.202`

```yaml
[Unit]
Description=etcd
Documentation=https://github.com/coreos


[Service]
ExecStart=/usr/local/bin/etcd \
  --name 192.168.0.202 \
  --cert-file=/etc/etcd/kubernetes.pem \
  --key-file=/etc/etcd/kubernetes-key.pem \
  --peer-cert-file=/etc/etcd/kubernetes.pem \
  --peer-key-file=/etc/etcd/kubernetes-key.pem \
  --trusted-ca-file=/etc/etcd/ca.pem \
  --peer-trusted-ca-file=/etc/etcd/ca.pem \
  --peer-client-cert-auth \
  --client-cert-auth \
  --initial-advertise-peer-urls https://192.168.0.202:2380 \
  --listen-peer-urls https://192.168.0.202:2380 \
  --listen-client-urls https://192.168.0.202:2379,http://127.0.0.1:2379 \
  --advertise-client-urls https://192.168.0.202:2379 \
  --initial-cluster-token etcd-cluster-0 \
  --initial-cluster 192.168.0.201=https://192.168.0.201:2380,192.168.0.202=https://192.168.0.202:2380 \
  --initial-cluster-state new \
  --data-dir=/var/lib/etcd
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Start etcd

```shell
sudo systemctl daemon-reload
sudo systemctl enable etcd
sudo systemctl start etcd
```

## Initialize Cluster on maser-1 (`192.168.0.201`)

```shell
gedit config.yaml
```

**config.yaml**

```yaml
apiVersion: kubeadm.k8s.io/v1beta2
kind: ClusterConfiguration
kubernetesVersion: stable
apiServerCertSANs:
  - 192.168.0.203
controlPlaneEndpoint: "192.168.0.203:6443"
etcd:
  external:
    endpoints:
      - https://192.168.0.201:2379
      - https://192.168.0.202:2379
    caFile: /etc/etcd/ca.pem
    certFile: /etc/etcd/kubernetes.pem
    keyFile: /etc/etcd/kubernetes-key.pem
networking:
  podSubnet: 10.96.0.0/24
apiServer:
  extraArgs:
    apiserver-count: "2"
```

Initialize cluster

```shell
$ sudo kubeadm init --config=config.yaml --v=2
...
You can now join any number of control-plane node by running the following command on each as a root:
kubeadm join 192.168.0.203:6443 --token 9vr73a.a8uxyaju799qwdjv --discovery-token-ca-cert-hash sha256:7c2e69131a36ae2a042a339b33381c6d0d43887e2de83720eff5359e26aec866 --control-plane --certificate-key f8902e114ef118304e561c3ecd4d0b543adc226b7a07f675f56564185ffe0c07

Please note that the certificate-key gives access to cluster sensitive data, keep it secret!
As a safeguard, uploaded-certs will be deleted in two hours; If necessary, you can use kubeadm init phase upload-certs to reload certs afterward.

Then you can join any number of worker nodes by running the following on each as root:
kubeadm join 192.168.0.203:6443 --token 9vr73a.a8uxyaju799qwdjv --discovery-token-ca-cert-hash sha256:7c2e69131a36ae2a042a339b33381c6d0d43887e2de83720eff5359e26aec866
```

Deploy network

```shell
mkdir -p $HOME/.kube
yes | sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
```

Copy the initialzed certificates to the second master

```shell
sudo scp -r /etc/kubernetes/pki username@192.168.0.202:~
```

## join cluster on maser-2 (`192.168.0.202`)

```shell
sudo rm ~/pki/apiserver.*
sudo mv ~/pki /etc/kubernetes/
sudo rm /etc/kubernetes/pki/apiserver.*
kubeadm join 192.168.0.203:6443 --token 9vr73a.a8uxyaju799qwdjv --discovery-token-ca-cert-hash sha256:7c2e69131a36ae2a042a339b33381c6d0d43887e2de83720eff5359e26aec866 --control-plane --certificate-key f8902e114ef118304e561c3ecd4d0b543adc226b7a07f675f56564185ffe0c07
mkdir -p $HOME/.kube
yes | sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

## join cluster on all raspberry pi

```shell
kubeadm join 192.168.0.203:6443 --token 9vr73a.a8uxyaju799qwdjv --discovery-token-ca-cert-hash sha256:7c2e69131a36ae2a042a339b33381c6d0d43887e2de83720eff5359e26aec866 --certificate-key f8902e114ef118304e561c3ecd4d0b543adc226b7a07f675f56564185ffe0c07
```

# CI/CD

## CI

After the code has been push to github it will automatically publish to Docker hub.

## CD

After the image has been updated, you can deploy from master node by the following command.

```shell
git pull
./redeploy_kube.sh
```

Fist time deploy

```shell
./make_kube.sh
```

Delete pod

```shell
./delete_kube.sh
```

# Finished

Now, you can access the website at [http://192.168.0.203](http://192.168.0.203)
