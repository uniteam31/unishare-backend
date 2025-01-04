# unishare-backend

Dev стенд -> [ссылка](http://176.114.90.241/) (работает в режиме воруй-убивай)

### Сборка Dockerfile

Основные ENV для работы задаются не при сборке, а в момент запуска в unishare-orchestration  

**ENV**: BRANCH  
**COMMANDS**:
1. Сборка образа -> `docker build --no-cache -t def1s/unishare-backend --build-arg BRANCH=... .` (точку не забывать)
2. Push -> `docker push def1s/unishare-backend` (optional)
3. Run -> `docker run def1s/unishare-backend`
4. Можно взять образ из DockerHub -> `docker pull def1s/unishare-backend`