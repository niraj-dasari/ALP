#!/bin/bash

sudo apt update
sudo apt install apache2 php libapache2-mod-php mariadb-server mariadb-client php-mysql php-curl php-xml php-mbstring php-imagick php-zip php-gd -y

sudo mysql -e "CREATE DATABASE wordpress_db;"
sudo mysql -e "CREATE USER 'wordpress_user'@'localhost' IDENTIFIED BY 'my_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON wordpress_db.* to wordpress_user@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
sudo mysql -e "exit"

sudo cp /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/wordpress.conf

sudo a2ensite wordpress.conf
sudo a2dissite 000-default.conf

sudo systemctl reload apache2

wget -O /tmp/wordpress.tar.gz https://wordpress.org/latest.tar.gz

sudo tar -xzvf /tmp/wordpress.tar.gz -C /var/www/html

sudo chown -R www-data.www-data /var/www/html/wordpress

echo "updating the DB_NAME,DB_PASSWORD,DB, DB_DATABASE"
sudo sed -i 's/database_name_here/wordpress_db/g' /var/www/html/wordpress/wp-config-sample.php
sudo sed -i 's/username_here/wordpress_user/g' /var/www/html/wordpress/wp-config-sample.php
sudo sed -i "s/password_here/my_password/g" /var/www/html/wordpress/wp-config-sample.php

echo "downloading the wp-cli"
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp

cd /var/www/html/wordpress/
sudo mv wp-config-sample.php wp-config.php

# echo "downloading the wp-cli from init.sh"
# wp core install --allow-root --path='/var/www/html/wordpress/' --url='${module.pip.ip_address}/wordpress/' --title='Semicolons_blog' --admin_user='${local.administrator_username}' --admin_password='${local.administrator_password}' --admin_email='dummy@abc.com'

# sudo systemctl reload apache2
