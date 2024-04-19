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
$ sudo apt install git libgtk-3-0 upower pulseaudio
```

## Audio > HDMI

```sh

$ sudo raspi-config

```

- RPI 3: System Options > Audio > vc4-hdmi
- RPI 4: System Options > Audio > vc4-hdmi
- RPI 5: System Options > Audio > vc4-hdmi-0 or 1

HDMI0 is de poort naast USB-C on RPI 5

## Install / Update rpi-infodisplay

```
cd ~ && \
rm -rf rpi-infodisplay && \
git clone https://github.com/johancoppens/rpi-infodisplay.git && \
cd rpi-infodisplay && \
npm install
cp config.template.json config.json

```

Optionally switch to other branch

```
$ git checkout standalone

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

Query display on RPI over ssh:

```
$ xrandr -display :0.0 -q

```

Edit .xinitrc to start rpi-infodisplay when X starts

```
$ nano ~/.xinitrc
...
xrandr -s 1920x1080
cd /home/edugo/rpi-infodisplay/
exec npm run start
```

Auto login user edugo

```
sudo raspi-config
```

System Options > Boot / Auto Login > Text console, automatically logged in as 'edugo' user

## Cron HDMI on/off

```
$ crontab -e

...

# Every weekday at 17:00 HDMI off
0 17 * * 1-5 DISPLAY=:0 xset dpms force off >/dev/null 2>&1
# Every weekday at 8:00 HDMI on
0 8 * * 1-5 DISPLAY=:0 xset dpms force on >/dev/null 2>&1
```

## Audio set volume

```
$ alsamixer
```

## Restart X

```
$ pkill X
```

## TODO

<!-- show info at boot for 15 secs -->

<!-- toggle info naar show 15 secs -->

OK dns displays.edugolo.be >> my dev pc

OK reload every hour?
