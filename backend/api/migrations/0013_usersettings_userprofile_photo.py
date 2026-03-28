from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_billing_billingitem'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='photo',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name='UserSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('general', models.JSONField(blank=True, default=dict)),
                ('business_profile', models.JSONField(blank=True, default=dict)),
                ('feature_settings', models.JSONField(blank=True, default=dict)),
                ('subscription', models.JSONField(blank=True, default=dict)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='settings', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]