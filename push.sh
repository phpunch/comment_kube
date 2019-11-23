docker login  
docker tag comment_kube_backend phpunch/comment_kube_backend:v4
docker push phpunch/comment_kube_backend:v4

docker tag comment_kube_frontend phpunch/comment_kube_frontend:v4
docker push phpunch/comment_kube_frontend:v4
