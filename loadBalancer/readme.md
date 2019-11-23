install with
```shell
sudo apt-get install haproxy
```

edit configuration
```shell
sudo gedit /etc/default/haproxy
```

add the following
```
listen kubernetesMaster
    bind 0.0.0.0:4334
    mode http
    stats enable
    stats uri /haproxy?stats
    stats realm admin\ admin
    stats auth admin:admin
    stats auth admin:password
    balance roundrobin
    option httpclose
    option forwardfor
    server master201 192.168.0.201 check
    server master202 192.168.0.202 check
defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    retries 3
    option redispatch
    timeout connect  5000
    timeout client  10000
    timeout server  10000
global
    log 127.0.0.1 local0 notice
    maxconn 2000
    user haproxy
    group haproxy
```

start server/reload
```shell
sudo service haproxy start
```
```shell
sudo service haproxy reload
```
