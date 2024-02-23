curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
exit
sudo raspi-config
ip addr
nvm install 18

sudo apt install -y libgtk-3-0 libnotify4 libgconf-2-4 libnss3 libgtk2.0-0 libxss1 libasound2 x-window-system rpi-chromium-mods
nano .bashrc

pi@raspberrypi:~ $ cat .xinitrc
cd /home/pi/app && exec npm run nieuwe -nocursor -nolisten tcp "$@"

Onderaan in .bashrc toevoegen, als het SSH is open hij startx niet
if ! [ -n "$SSH_CLIENT" ] || ! [ -n "$SSH_TTY" ]; then
SESSION_TYPE=remote/ssh
startx -- -nolisten tcp -s 0 dpms -nocursor
fi

Remote pi naar deze kopieren$ scp -rp pi@10.5.0.3:/home/pi/app/\* ~/app
$ cd ~/app
$ rm -rf node_modules package-lock.json
$ npm i
$ nano ~/app/src/nieuwedisplay.js

# RPi OS

Rasberry Pi OS lite installeren met rpi-imager

user: edugo 3...9
no wifi config
toetsenbord / tijdszone Belgie
enable ssh

# IP Address

Op de Pi.

```
$ ip addr
```

Inloggen met ssh

```
$ ssh edugo@10.21.10.119

```

Instellen IP met raspi-config

```
$ sudo raspi-config
```

Advanced Options > Network Config > Network Manager

TODO: FIxed IP

# X Windows + Additional packages for electron + rpi-chromium-mods

```
$ sudo apt install libgtk-3-0 libnotify4 libgconf-2-4 libnss3 libgtk2.0-0 libxss1 libasound2 x-window-system
```

# Config x windows

Start x on pi

```
$ startx

```

# Start X from SSH

edit

```
sudo nano /etc/X11/Xwrapper.config
```

```
allowed_users=anybody

```

Now you can start x remotely over ssh with

```
$ sudo DISPLAY=:0.0 startx
```

# Nodejs

Node Version Manager

https://github.com/nvm-sh/nvm

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

```
nvm install
```

exit
sudo raspi-config
ip addr
nvm install 18

# OpenGL

sudo raspi-config
Advanced options -> GL driver

rpi-chromium-mods???

scp -r pi@10.5.0.3:/home/pi/app ~/app
