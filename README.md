# rpi-infodisplay

## RPi OS

Rasberry Pi OS lite installeren met rpi-imager

```
$ sudo rpi-imager
```

Choose Raspberry PI 5 to install (also for PI 3 B+)

OS: Other > Raspberry PI OS Lite (64-bit) NOT Legacy!

User: edugo 3...9
No wifi config
Keyboard / timezone Belgie
Enable ssh

Boot

```
$ sudo apt update
$ sudo apt full-upgrade

```

Reboot

## X Windows

```
$ sudo apt install xorg
```

Start X Windows on Pi

```
$ startx
```

Should start a graphical X terminal

## NodeJS

Install Node Version Manager

https://github.com/nvm-sh/nvm

Download and run install script

```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Activate nvm command

```sh
$ source ~/.bashrc
```

Install nodeJS V18

```sh
$ nvm install 18
```

Verify

```sh
$ node --version
v18.19.1
$ npm --version
10.2.4
```

## Other Packages

```sh
$ sudo apt install git
$ sudo apt install libgtk-3-0
$ sudo apt install upower
$ sudo apt install pulseaudio

```

## Audio > HDMI

```sh

$ sudo raspi-config

```

RPI 4: System Options > Audio > vc4-hdmi
RPI 5: System Options > Audio > vc4-hdmi-0 or 1

## Install / Update rpi-infodisplay

```
cd ~ && \
rm -rf rpi-infodisplay && \
git clone https://github.com/johancoppens/rpi-infodisplay.git && \
cd rpi-infodisplay && \
npm install

```

## Configure X

Edit .bashrc to start X on login

```
$ nano ~/.bashrc
...
if [ -z "$DISPLAY" ] && [ "$XDG_VTNR" = 1 ]; then
  exec startx -- -nolisten tcp -s 0 dpms -nocursor
fi

```

Edit .xinitrc to start rpi-infodisplay when X starts

```
$ nano ~/.xinitrc
...sh
xrandr -s 1920x1080
cd /home/edugo/rpi-infodisplay/
exec npm run start
```

Auto login user edugo

```
sudo raspi-config
```

System Options > Boot / Auto Login > Text console, automatically logged in as 'edugo' user

## Audio set volume

```
$ alsamixer
```

## Restart X

```
$ pkill X
```

## TODO

cron hdmi

show info at boot for 15 secs
